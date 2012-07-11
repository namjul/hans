/**
 * Dependencies.
 */
var fs = require("fs");
var util = require("util");
var path = require("path");
var _ = require("underscore");
var wrench = require("wrench");
var helper = require("./helper");
var app = require("./index");
var stylus = require("stylus");
var ejs = require("ejs");
var uglify = require("uglify-js");
var stitch = require("stitch");
var browserify = require('browserify');

/**
 * Compile function for stylues files
 *
 * @param {string} _path
 */

var compileCss = function(_path) {
	var content = fs.readFileSync(_path, 'utf8')
	var result = '';
	stylus(content)
		//.set('linenos', true)
		.set('compress', app.config.get('compress'))
		.include(require('nib').path)
		.include(path.dirname(_path))
		.render(function(err, css) {
			if(err) throw err;
			result = css;
		});
	return result;
};

require.extensions['.styl'] = function(module, filename) {
	var source = compileCss(filename);
  	module.exports = source;
};

/**
 * Compile.
 * 
 * @type {Object}
 */
var compile = module.exports;

/**
 * root location for build
 */
compile.location = app.config.get('build') + '/build/';

/**
 * compiles all the css into one file
 */
compile.css = function() {

	var stylesheetHeader = fs.readFileSync(__dirname + "/../templates/stylesheetHeader.ejs", 'utf8');

	var cssPath = require.resolve(path.resolve(app.config.get('css')));
    delete require.cache[cssPath];
	var css = require(cssPath);

	var config = {
		name: app.config.get('name'),
		uri: app.config.get('uri'),
		author: app.config.get('author'),
		author_uri: app.config.get('author_uri'),
		description: app.config.get('description'),
		version_number: app.config.get('version_number'),
		license_name: app.config.get('license_name'),
		license_uri: app.config.get('license_uri'),
		tags: app.config.get('tags'),
		comments: app.config.get('comments')
	};

	var css = ejs.render(stylesheetHeader, {config: config}) + '\n' + css;
	fs.writeFileSync(this.location + '/style.css', css);

	app.log.info('css changed, compiled and moved over');
};


/**
 * compiles all the js into one file
 */
compile.js = function() {

 	var jsDir = this.location + app.config.get('outputJs');
 	var libs = app.config.get('libs');

	var compileLibs = function() {
		var result = [];
		for(var i=0, len=libs.length; i<len; i++) {
			var lib = libs[i];
			result.push(fs.readFileSync(lib, 'utf8'));
		}
		return result.join('\n');
	};

	var compileModules_Stitch = function(cb) {

		var package = stitch.createPackage({
		  paths: [path.dirname(app.config.get('js'))],
		  dependencies: app.config.get('libs')
		});

		package.compile(cb);

	};

	var compileModules = function() {
		var opts = {};
		if(app.argv.debug) {
			opts.debug = true;
		}
		var b = browserify(app.config.get('js') + '.js', opts);
		return b.bundle();
	};


	var result = [compileLibs(), compileModules()].join('\n');
	if(!app.argv.debug) {
		result = uglify(result);
	}
	if(!path.existsSync(jsDir)) {
		wrench.mkdirSyncRecursive(jsDir, 0755);
	}
	fs.writeFileSync(jsDir + '/theme.js', result);

	app.log.info('js changed, compiled and moved over');

};


/**
  * compile js && css files
  */
compile.all = function(location) {

	if(location) {
		this.location = location;	
	}

	this.css();
	this.js();
};
