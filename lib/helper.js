/**
 * Dependencies.
 */
var fs = require("fs");
var util = require("util");

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
exports.logChange = function(file, type) {
	type = type || 'create';
	console.log('\u001B[33m'+type+'\u001B[m: ' + file);
};

/**
 * Copy files
 */
exports.copyFile = function(src, dst, cb) {

 	function copy(err) {
    var is, os;

    fs.stat(src, function (err) {
      if (err) {
        return cb(err);
      }
      is = fs.createReadStream(src);
      os = fs.createWriteStream(dst);
      util.pump(is, os, cb);
    });
  }

  fs.stat(dst, copy);

};

/**
 * Removes all c-styled comments from a string
 * https://github.com/soggie/norris-json/blob/master/lib/norris-json.js
 */
exports.removeComments = function(str) {
  // Remove all C-style slash comments
  str = str.replace(/(?:^|[^\\])\/\/.*$/gm, '');
  // Remove all C-style star comments
  str = str.replace(/\/\*[\s\S]*?\*\//gm, '');
  return str;
}

