var Promise = require('bluebird');

module.exports = function (data) {
    data.push(2);
    return Promise.resolve(2);  // Asynchronous call should works
};