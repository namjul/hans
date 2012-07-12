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

/**
 * Outputs create file statement
 */
 exports.logCreate = function(file, type) {
 	type = type || 'create';
  	console.log('\u001B[33m'+type+'\u001B[m: ' + file);
 };

