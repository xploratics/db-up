[![Build Status](https://travis-ci.org/xploratics/db-up.svg)](https://travis-ci.org/xploratics/db-up)
[![dependencies Status](https://david-dm.org/xploratics/db-up/status.svg)](https://david-dm.org/xploratics/db-up)
[![devDependencies Status](https://david-dm.org/xploratics/db-up/dev-status.svg)](https://david-dm.org/xploratics/db-up?type=dev)

# db-up
This component allow to migrate a database (schema / data) from a version to the most recent version.
Using javascript files in a folder, will find those files and execute them in sequencial order. 

## Usage

```js
var updater = require('db-up');

updater
    .update({  path: './patches', version: 10 })
    .then(function () {
        console.log('update completed.');
    });
```

## Installation

```bash
$ npm install db-up
```

Put update files in a `./patches` folder.
Each file should be identified with a number followed by the `.js` extension.

### Example structure

```bash
project
    |- patches
        |- 1.js
        |- 2.js
        |- 3.js
```

## update
Updater function takes an options object with the following parameters.

### Returns
A promise that is resolved when all patches as been applied.
If a patch fail, all subsequent patches are not run and the updater invoke
the catch branch of the promise.

### Options

- data:
Optionnal data that can be passed to the patches.
Usefull for passing a dbContext or connection string.
- path:
The path to the folder containing the patches. Default is `./patches`
- version:
The current version of the database.
The updater will run the script where the name is greater than this number. 
- onApplyingPatch:
A function called before applying a patch.
- onAppliedPatch:
A function called after a patch has been applied.
If the patch cannot be applied, the event won't be called.

## Example of a patch file.

Name the file as 1.js and put it in the `./patches` folder.
```js
var Promise = require('bluebird');

module.exports = function () {
    return new Promise(function (resolve) {
        // do something to update
        // resolve the promise once it's done.
        resolve();
    });
}
```

You can omit the promise as well if you are not required to.

```js
module.exports = function () {
    // do something to update
}
```

## Development and test
Clone the project

```bash
#Clone the project
https://github.com/xploratics/db-up.git

#Move into the cloned repo
cd db-up

#Install all dependencies
npm install

#Run the tests
npm test
```

## License
MIT License
