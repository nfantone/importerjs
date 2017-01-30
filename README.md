# importerjs

[![Greenkeeper badge](https://badges.greenkeeper.io/nfantone/importerjs.svg)](https://greenkeeper.io/)

Command line utility to push bulks of JSON objects to an external or local API via HTTP requests. Like `curl`, but bulkier.

[![js-semistandard-style](https://cdn.rawgit.com/flet/semistandard/master/badge.svg)](https://github.com/Flet/semistandard)

```sh
git clone git@github.com:nfantone/importerjs.git
cd importerjs
npm i --production
./importer.js http://54.213.196.35:3000/endpoint -d ./data.json
```

### Usage

The utility follows a simple console interface.

```sh
Usage: importer.js [-X method] <url> [options]

Options:
  -X             Specify request method to use                [default: "POST"]
  -H             Pass custom header to server                           [array]
  -v, --verbose  Sets the verbosity level for log messages              [count]
  -h, --help     Show help                                            [boolean]
  -d, --data     Path to .json file or inline JSON data              [required]
  -V, --version  Show version number                                  [boolean]

https://github.com/nfantone
```

You may either provide a relative or absolute path to a `.json` or just inline it. 

The JSON file may contain a single object or an array. For each object in the file, **importerjs** will execute a request to the provided `<url>` with it as its body.


### Examples

+ `POST` an object to `http://localhost:3000`.

```sh
./importer.js http://localhost:3000 -d '{"someKey": "value"}'
#or
# ./importer.js -XPOST http://localhost:3000 -d object.json
```

+ `POST` an array of transactions to `http://54.213.196.35:3010/transactions`.

```javascript
// transactions.json
[{
    "id": 34,
    "promoCode": "P-4753CX",
    "product": {
        "code": "ar757",
        "name": "Something"
    },
    "quantity": 2,
    "payment": "AMEX"
}, 
{
    "id": 467,
    "promoCode": null,
    "product": {
        "code": "gbr994",
        "name": "Anything"
    },
    "quantity": 1,
    "payment": "PAYPAL"
}]
```

The following will result in two `POST` requests to the endpoint, one for each transaction:

```sh
./importer.js http://54.213.196.35:3010/transactions -d ./transactions.json
```

+ Update an entity via `PUT` and provide authentication credentials.

```sh
./importer.js -XPUT http://localhost:3000/api/v1/entity -d '{ "saved": true }' -H 'Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6ImJlZTg'
```


## License

[MIT](https://opensource.org/licenses/MIT)
