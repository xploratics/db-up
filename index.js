var debug = require('debug')('db-updater');
var path = require('path');
var Promise = require('bluebird');
var readdir = Promise.promisify(require("fs").readdir)

exports.update = function (options) {
    if (!options) options = {};

    var data = options.data;
    var root = path.resolve(options.path || './patches');
    var currentVersion = options.version || 0;
    var onApplyingPatch = options.onApplyingPatch || noop;
    var onAppliedPatch = options.onAppliedPatch || noop;

    debug(`reading directory ${root}`);

    return readdir(root)
        .then(function (files) {
            debug(`found ${files.length} file(s) in folder`);

            var patches = [];

            for (var i = files.length - 1; i > -1; i--) {
                var f = files[i];

                // use only the files named correctly.
                if (!f.match(/^[0-9]+.js$/gi))
                    continue;

                var id = parseInt(f.replace(/.js$/gi, ""));

                // accept patches that comes after the current version.
                if (id <= currentVersion)
                    continue;

                var filename = path.join(root, f);
                patches.push({ filename, id });
            }

            patches.sort(sortPatches);
            debug(`found ${patches.length} file(s) to be applied`);
            return patches;
        })
        .mapSeries(applyPatch)
        .then(completed);

    function applyPatch(patch) {
        return new Promise(apply).then(completed, error);

        function apply(resolve, reject) {
            onApplyingPatch(patch);
            debug(`applying patch ${patch.id}`);

            var r = require(patch.filename)(data);

            // if a promise is returned, then use the promise
            if (r.then)
                r.then(resolve, reject);
            else
                resolve(r);
        }

        function completed(result) {
            var output = { patch, result };
            debug('patch applied');
            onAppliedPatch(output);
            return output;
        }

        function error(err) {
            debug(`error while applying patch ${err.toString()}`);
            return Promise.reject(err);
        }
    }
};

function completed(e) {
    debug('completed');
    return e;
}

function noop() { }
function sortPatches(a, b) { return a.id - b.id; }