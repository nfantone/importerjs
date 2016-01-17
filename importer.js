#!/usr/bin/env node

/**
 * Command line utility to import an array of
 * of JSON objects and push each one into any
 * endpoint of an HTTP API.
 *
 * @author nfantone
 */
'use strict';

var winston = require('winston');
var argv = require('yargs')
  .usage('Usage: $0 [-X method] <url> [options]')
  .demand(['data'])
  .describe('data', 'Path to .json data file')
  .nargs('data', 1)
  .alias('d', 'data')
  .describe('X', 'Specify request method to use')
  .default('X', 'POST')
  .describe('H', 'Pass custom header to server')
  .array('H')
  .count('verbose')
  .alias('v', 'verbose')
  .help('h')
  .alias('h', 'help')
  .version(function() {
    return require('../package').version;
  })
  .epilog('https://github.com/nfantone').argv;

argv.verbose = Math.min(argv.verbose + winston.config.cli.levels.info, winston.config.cli.levels.silly);

var start = Date.now();
var moment = require('moment');
var async = require('async');
var util = require('util');
var shortid = require('shortid');
var invert = require('lodash.invert');
var url = require('valid-url');
var path = require('path');
var request = require('request');
var log = new winston.Logger({
  transports: [
    new winston.transports.Console({
      colorize: true,
      level: invert(winston.config.cli.levels)[argv.verbose],
      label: 'importer.js'
    })
  ]
});

log.cli();
var data;
var requests = [];
var headers = {};
var apiEndpointUrl = argv._[0];

function exit() {
  log.info("try './importer.js --help' for more information");
  log.debug('Done');
  return process.exit();
}

// Validate URL positional argument
if (!url.isWebUri(apiEndpointUrl)) {
  log.error('Invalid URL provided: %s', apiEndpointUrl);
  exit();
}

// Fetch data from json file
try {
  data = require(argv.data);
  data = util.isArray(data) ? data : [data];
  log.info('Loaded file [%s]', path.resolve(argv.data));
  log.debug('Found %s data entries', data.length);
} catch (e) {
  log.error('File not found [%s]', argv.data);
  exit();
}

// Generate headers object
if (argv.H) {
  for (var i = argv.H.length - 1; i >= 0; i--) {
    var h = argv.H[i].split(/\s*:\s*/);
    headers[h[0]] = h[1];
  }
}

// Make requests to endpoint
data.forEach(function(d, i) {
  var reqId = shortid.generate();
  requests.push(function(cb) {
    log.info('{req-%s} [%s] %s [%s/%s]', reqId, argv.X, apiEndpointUrl, i + 1, data.length);
    log.verbose('{req-%s} Request body: %s', reqId, JSON.stringify(d));
    request({
      method: argv.X,
      url: apiEndpointUrl,
      json: true,
      headers: headers,
      body: d
    }, function(err, res, body) {
      if (err) {
        log.error('{req-%s} Request failed', reqId, err);
      } else {
        if (res.statusCode >= 400) {
          log.warn('{req-%s} Request failed (%s - %s)', reqId, res.statusCode, res.statusMessage);
        } else {
          log.debug('{req-%s} Request successful (%s - %s)', reqId, res.statusCode, res.statusMessage);
        }
        log.verbose('{req-%s} Got response back: %s', reqId, JSON.stringify(body));
      }
      return cb(err);
    });
  });
});

// Wait for requests to complete
async.parallel(requests, function(err) {
  if (err) {
    log.warn('There were errors on some requests (see above)');
  }
  log.info('%s request%s completed %s', requests.length,
    requests.length > 1 ? 's' : '', moment.duration(moment().diff(start)).humanize(true));
});
