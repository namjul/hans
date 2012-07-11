/**
 * Dependencies.
 */
var fs = require("fs");

/**
 * Checks path if folder
 *
 * param {String} path
 */
exports.isDir = function(path) {
	return fs.statSync(path).isDirectory();
};