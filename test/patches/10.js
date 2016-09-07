var Promise = require('bluebird');

module.exports = function (data) {
    data.push(10);
    return Promise.resolve(10);
};