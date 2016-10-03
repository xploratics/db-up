var co = require('co');
var debug = require('debug')('db-up');
var path = require('path');
var Promise = require('bluebird');
var readdir = Promise.promisify(require("fs").readdir)

exports.update = co.wrap(function* (options) {
    if (!options) options = {};

    var data = options.data;
    var root = path.resolve(options.path || './patches');
    var currentVersion = options.version || 0;
    var onApplyingPatch = options.onApplyingPatch || noop;
    var onAppliedPatch = options.onAppliedPatch || noop;

    debug(`reading directory ${root}`);

    var files = yield readdir(root);
    debug(`found ${files.length} file(s) in folder`);

    var patches = filterPatches(files, root, currentVersion);
    debug(`found ${patches.length} file(s) to be applied`);

    var results = [];

    for (var i = 0; i < patches.length; i++)
        results.push(yield applyPatch(patches[i]));

    debug('completed');
    return results;

    function* applyPatch(patch) {

        try {
            onApplyingPatch(patch);
            debug(`applying patch ${patch.id}`);

            var r = require(patch.filename)(data);
            var result;
            switch (typeof r) {
                case 'function':
                case 'object':
                    result = yield r;
                    break;
                default:
                    result = r;
                    break;
            }

            var v = { patch, result };

            onAppliedPatch(v);
            debug('patch applied');

            return v;

        } catch (err) {
            debug(`error while applying patch ${err.toString()}`);
            throw err;
        }
    }
});

function filterPatches(files, root, currentVersion) {
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
    return patches;
}

function noop() { }
function sortPatches(a, b) { return a.id - b.id; }