/**
 * Dependencies.
 */
var fs = require("fs");
var util = require("util");
var path = require("path");
var _ = require("underscore");
var wrench = require("wrench");
var helper = require("./helper");
var app = require("./app");
var stylus = require("stylus");
var ejs = require("ejs");
var uglify = require("uglify-js");
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
		.set('compress', app.config.get('minify') || app.argv.m)
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

	var self = this;
	var stylesheetHeader = fs.readFileSync(__dirname + "/../templates/stylesheetHeader.ejs", 'utf8');
	var cssLocation = path.normalize(app.config.get('css'));
	var adminCssLocation = path.normalize(app.config.get('admincss'));
 	var libs = app.config.get('csslibs');

  // first add css files defined in config.json
	var compileLibs = function() {
		var result = [];
		for(var i=0, len=libs.length; i<len; i++) {
			var lib = path.normalize(libs[i]);
			result.push(fs.readFileSync(lib, 'utf8'));
		}
		return result.join('\n');
	};

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

	var output = [];
	
	// client CSS
  if(cssLocation === '.') return;

  var cssPath = require.resolve(path.resolve(cssLocation));
  delete require.cache[cssPath];
  var css = require(cssPath);

  var out = self.location + 'style.css';
  var data = [ejs.render(stylesheetHeader, config), compileLibs(), css].join('\n');
  fs.writeFileSync(out, data);
  if(self.build) helper.logChange(out);
  output.push(out);

	// admin CSS
  if(adminCssLocation === '.') return;

  var cssPath = require.resolve(path.resolve(adminCssLocation));
    delete require.cache[cssPath];
  var css = require(cssPath);

  var out = self.location + 'admin.css';
  var data = [css].join('\n');
  fs.writeFileSync(out, data);
  if(self.build) helper.logChange(out);
  output.push(out);

  return output;
};


/**
 * compiles all the js into one file
 */
compile.js = function() {

 	var jsDir = this.location + app.config.get('outputJs');
 	var libs = app.config.get('jslibs');
 	var js = path.normalize(app.config.get('js'));
 	var adminjs = path.normalize(app.config.get('adminjs'));
 	var self = this;

	if(!fs.existsSync(path.dirname(js))) return;

	var compileLibs = function() {
		var result = [];
		for(var i=0, len=libs.length; i<len; i++) {
			var lib = path.normalize(libs[i]);
			result.push(fs.readFileSync(lib, 'utf8'));
		}
		return result.join('\n');
	};

	/*

	var compileModules_Stitch = function(cb) {

		var package = stitch.createPackage({
		  paths: [path.dirname(js)],
		  dependencies: libs 
		});

		package.compile(cb);

	};
	*/

	var compileModules = function(jsFile) {
		var opts = {};
		if(app.argv.debug) {
			opts.debug = true;
		}
		if(path.extname(jsFile) === '') {
			if(fs.existsSync(jsFile+'.coffee')) {
				jsFile = jsFile + '.coffee';
			} else {
				jsFile = jsFile + '.js';
			}
		}
		var b = browserify(jsFile, opts);
		return b.bundle();
	};


	var output = [];
	
	// client JS
	(function() {

		if(js === '.') return;

		var result = [compileLibs(), compileModules(js)].join('\n');
		var out = jsDir + '/theme.js';
		if(app.config.get('minify') || app.argv.m) {
			result = uglify(result);
		}
		if(!fs.existsSync(jsDir)) {
			wrench.mkdirSyncRecursive(jsDir, 0755);
		}
		fs.writeFileSync(out, result);
	    if(self.build) helper.logChange(out);
	    output.push(out);

	})();

	// admin JS
	(function() {

		if(adminjs === '.') return;

		var result = [compileModules(adminjs)].join('\n');
		var out = jsDir + '/admin.js';
		if(app.config.get('minify') || app.argv.m) {
			result = uglify(result);
		}
		if(!fs.existsSync(jsDir)) {
			wrench.mkdirSyncRecursive(jsDir, 0755);
		}
		fs.writeFileSync(out, result);
	    if(self.build) helper.logChange(out);
	    output.push(out);

	})();
	
    return output;
};


/**
  * compile js && css files
  */
compile.all = function(build) {
	this.build = build;
	var resultPaths = [];
	resultPaths = resultPaths.concat(this.css());
	resultPaths = resultPaths.concat(this.js());
	return resultPaths;
};
