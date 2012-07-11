/**
 * Dependencies.
 */
var fs = require("fs");
var util = require("util");
var path = require("path");
var helper = require("./helper");
var _ = require("underscore");
var wrench = require('wrench');
var compile = require("./compile");
var move = require("./move");

/**
 * Commands.
 * 
 * @type {Object}
 */
var commands = module.exports;

/**
 * Outputs lib version.
 */
commands.version = function() {
  this.log.info(require('../package.json').version);
};

/**
 * Creates the wordpress theme files and folders
 *
 * @param {string} appName
 */
commands.create = function(appName) {

  	var template = __dirname + "/../templates/default";
  	var appLocation = null;
  	var themeName = null;

  	// check if themename is beaing passed
  	if(typeof(appName) !== 'string') {
    	this.log.error('provide an theme name');
    	return;
  	}

  	appLocation = path.normalize(appName);
  	themeName = appLocation.split('/', 1);

  	// Create dir
  	if(path.existsSync(appLocation)) {
    	this.log.error(appLocation + ' already exists');
    	return;
  	}
  	fs.mkdirSync(appLocation, 0755);

  	this.log.info('Creating theme: \u001B[33m' + appName + '\u001B[m');

  	var themeValues = {
    	"theme": themeName
  	};

  	var parse = function(data) {
    	return data.replace(/\{\{([^}]+)\}\}/g, function(match, p) {
      		return themeValues[p];
    	});
  	};

  	// creates array with all files
  	var files = function() {
	    var files = [];
	    var next = function(dir) {
	      	var dirFiles = fs.readdirSync(dir);
	      	for(var i in dirFiles) {
	        	var file = dir + '/' + dirFiles[i];
	        	files.push(file);
	        	if(helper.isDir(file)) next(file);
	      	}
	    };
	    next(template);
	    return files;
  	}();

  	for(var i in files) {
    	var file = files[i];
    	var out = file.replace(template, '');
    	out = path.join(appLocation, out);
    	out = path.normalize(out);


    	if(helper.isDir(file)) {
      		fs.mkdirSync(out, 0775);
      		this.log.info("create: ", out);
    	} else if(path.existsSync(out)) {
      		this.log.error(out, 'alreay exists');
    	} else {
      		var data = parse(fs.readFileSync(file, 'utf8'));
      		fs.writeFileSync(out, data);
      		this.log.info("create: ", out);
    	}
  	}

};

/**
 * Builds the theme
 */
commands.build = function(location) {

	// TODO: check for location

	// Empty the build directory 
	wrench.rmdirSyncRecursive(this.config.get('build'), true);
	wrench.mkdirSyncRecursive(this.config.get('build')+'/build', 0755);

	// move theme files
	move.all();
	compile.all();
};

/**
 * Watches the theme for file changes
 */
commands.watch = function() {

	var i = 0;

	// first build the hole thing
	_.bind(commands.build, this)();

	this.log.info('started watching files');

	// get folders from config
	var functions = this.config.get('functions');
	var templates = this.config.get('templates');
	var includes = this.config.get('includes');
	var assets = this.config.get('assets');
	var css = path.dirname(this.config.get('css'));
	var js = path.dirname(this.config.get('js'));
	var libs = [];

	// add only libs dirname and which are not in the js folder, because we would unessesary events firing
	for(i=0, len=this.config.get('libs').length; i<len; i++) {
		var lib = this.config.get('libs')[i];
		var libDir = path.dirname(lib);
		if(lib.indexOf(path.normalize(js)) === -1 && libs.indexOf(libDir) === -1) {
			libs.push(libDir);
		}
	}

	// create watch directory list
	var watchDirs = libs.concat(functions, templates, includes, assets, css, js);

	// start watching dirs
	for(i=0, len=watchDirs.length; i<len; i++) {
		var dir = watchDirs[i];

		if(path.existsSync(dir)) {

			var type = {};

			if(dir === functions) {
				type = { name: 'move', method: 'functions'};
			} else if(dir === templates) {
				type = { name: 'move', method: 'templates'};
			} else if(dir === includes) {
				type = { name: 'move', method: 'includes'};
			} else if(dir === assets) {
				type = { name: 'move', method: 'assets'};
			} else if(dir === css) {
				type = { name: 'compile', method: 'css'};
			} else if(dir === js) {
				type = { name: 'compile', method: 'js'};
			} else if(libs.indexOf(dir) !== -1) {
				type = { name: 'compile', method: 'js'};
			}

			// prevent event firing two times
			var lastChangeTime = 0;

			(function(obj, type) {

				require('watch').watchTree(dir, _.bind(function(file, curr, prev) {

					if (curr && lastChangeTime !== +curr.mtime) {

						lastChangeTime = +curr.mtime;

						if(type.name === 'compile') {
							compile[type.method]();							
						} else {
							move[type.method](file);
						}
					}
					
				}, obj));

			})(this, type)

		}
	}

};

/**
 * Links the theme to a wordpress installation
 */
commands.link = function(linkSource) {
 	var buildDir = this.config.get('build') + '/build';
 	// check if linkSource already exists -> ask for overwrite
	fs.symlinkSync(buildDir, linkSource);
	this.log.info('link created to: ', linkSource);
};

