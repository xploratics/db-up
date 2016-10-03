var Promise = require('bluebird');

module.exports = function* (data) {
    data.push(10);
    var v = yield Promise.resolve(10); // generator calls should work
    return v;
};