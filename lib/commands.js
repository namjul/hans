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
var watch = require('watch');

/**
 * Commands.
 * 
 * @type {Object}
 */
var commands = module.exports;

/**
 * Outputs lib version.
 */
commands.version = function(cb) {
  this.log.info(require('../package.json').version);
};

/**
 * Creates the wordpress theme files and folders
 *
 * @param {string} appName
 */
commands.create = function(appName, cb) {

  	var template = __dirname + "/../templates/default";
  	var appLocation = null;
  	var themeName = null;

  	// check if themename is beaing passed
  	if(!_.isString(appName)) {
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
      		helper.logCreate(out);
    	} else if(path.existsSync(out)) {
      		this.log.error(out, 'alreay exists');
    	} else {
      		var data = parse(fs.readFileSync(file, 'utf8'));
      		fs.writeFileSync(out, data);
      		helper.logCreate(out);
    	}
  	}

};

/**
 * Builds the theme
 */
commands.build = function(location, cb) {

	// check if location is beaing passed
	location = _.isString(location) ? path.normalize(location + '/') : 'build/';

  	if(!path.existsSync(location)) {
		wrench.mkdirSyncRecursive(location, 0755);
  		helper.logCreate(location);
  	} else {
  		helper.logCreate(location, 'exists');
  	}

	// move theme files
	move.location = location;
	compile.location = location;
	move.all(true);
	compile.all(true);
};

/**
 * Watches the theme for file changes
 */
commands.watch = function(cb) {

	var i = 0;

	// first build the hole thing
	wrench.rmdirSyncRecursive(this.config.get('build'), true);
	wrench.mkdirSyncRecursive(this.config.get('build')+'/build', 0755);
	move.all();
	this.log.info('Moved functions, templates and assets');
	compile.all();
	this.log.info('Compiles JS and CSS');

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

	// start watching config.js
	var self = this;
    fs.watchFile('./config.json', function (curr, prev) {
		self.log.info('config.json changed rebuilding..');
		_.bind(commands.build, self)();
    });

	// start watching dirs
	for(i=0, len=watchDirs.length; i<len; i++) {
		var dir = watchDirs[i];

		if(path.existsSync(dir)) {

			var type = {};

			if(dir === functions) {
				type = { name: 'move', method: 'functions', msg: 'functions changed, moved over'};
			} else if(dir === templates) {
				type = { name: 'move', method: 'templates', msg: 'templates changed, moved over'};
			} else if(dir === includes) {
				type = { name: 'move', method: 'includes', msg: 'functions changed, moved over'};
			} else if(dir === assets) {
				type = { name: 'move', method: 'assets', msg: 'assets changed, moved over'};
			} else if(dir === css) {
				type = { name: 'compile', method: 'css', msg: 'stylesheet changed, compiled and moved over'};
			} else if(dir === js) {
				type = { name: 'compile', method: 'js', msg: 'javascript changed, compiled and moved over'};
			} else if(libs.indexOf(dir) !== -1) {
				type = { name: 'compile', method: 'js', msg: 'javascript changed, compiled and moved over'};
			}

			// prevent event firing two times
			var lastChangeTime = 0;

			(function(obj, type) {

				watch.watchTree(dir, _.bind(function(file, curr, prev) {

					if (curr && lastChangeTime !== +curr.mtime) {

						lastChangeTime = +curr.mtime;

						if(type.name === 'compile') {
							compile[type.method]();							
						} else {
							move[type.method](file);
						}
						if(type.msg)  {
							obj.log.info(type.msg);
						}
					}
					
				}, obj));

			})(this, type)

		}
	}

	this.log.info('started watching files');

};

/**
 * Links the theme to a wordpress installation
 */
commands.link = function(linkSource, cb) {
 	var buildDir = this.config.get('build') + '/build';
 	// TODO: check if linkSource already exists -> ask for overwrite
	fs.linkSync(buildDir, linkSource);
	this.log.info('link created to: ', linkSource);
};

