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
require('node-zip');

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
  	if(fs.existsSync(appLocation)) {
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
      		dirFiles.forEach(function (f, index) {
	        	var file = dir + '/' + f;
	        	files.push(file);
	        	if(helper.isDir(file)) next(file);
      		});
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
      		helper.logChange(out);
    	} else if(fs.existsSync(out)) {
      		this.log.error(out, 'alreay exists');
    	} else {
      		var data = parse(fs.readFileSync(file, 'utf8'));
      		fs.writeFileSync(out, data);
      		helper.logChange(out);
    	}
  	}

};

/**
 * Builds the theme
 *
 * @param {string} location
 */
commands.build = function(location, cb) {


	location = location || 'build/';
	location = path.normalize(location + '/');

	var build = false;

	if(location === 'build/') {
		wrench.rmdirSyncRecursive(path.normalize(this.config.get('build')), true);
	}

	if(_.isFunction(cb)) {
		build = true;	
	}

  	if(!fs.existsSync(location)) {
		wrench.mkdirSyncRecursive(location, 0755);
  		helper.logChange(location);
  	} else {
  		helper.logChange(location, 'exists');
  	}

	// move theme files
	move.location = location;
	compile.location = location;
	var movedFiles = move.all(build);
	var compiledFiles = compile.all(build);
	return movedFiles.concat(compiledFiles);
};

/**
 * Watches the theme for file changes
 */
commands.watch = function(cb) {

	var i = 0;

	// first build the hole thing
	_.bind(commands.build, this, this.config.get('build') + '/build/')();
	this.log.info('Moved functions, templates and assets');
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
	var checkLibs = function(_libs, check) {
		for(i=0, len=_libs.length; i<len; i++) {
			var lib = _libs[i];
			var libDir = path.dirname(lib);
			if(lib.indexOf(path.normalize(check)) === -1 && libs.indexOf(libDir) === -1) {
				libs.push(libDir);
			}
		}
	}
	checkLibs(this.config.get('jslibs'), js);
	checkLibs(this.config.get('csslibs'), css);

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

		if(fs.existsSync(dir)) {

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

				watch.watchTree(dir, _.bind(function(file, curr, prev) {

					if (curr && lastChangeTime !== +curr.mtime) {

						lastChangeTime = +curr.mtime;

						if(type.name === 'compile') {
							compile[type.method]();							
						} else {
							move[type.method](file);
						}

						helper.logChange(file, 'changed')

					}
					
				}, obj));

			})(this, type)

		}
	}

	this.log.info('started watching files');

	if(this.argv.l) {

		this.log.warn('livereload currently not supported, maybe in the future :)');

	}

};

/**
 * Links the theme to a wordpress installation
 *
 * @param {string} link 
 */
commands.link = function(link, cb) {
 	var buildDir = this.config.get('build') + '/build';
 	var configLink= this.config.get('linkPath');
 	var self = this;

 	if(!_.isString(link)) {
 		if(configLink=== '') {
 			this.log.error('please provide link path');	
 			return;
 		} else {
 			link = path.normalize(configLink);
 		}
 	}

  	if(!fs.existsSync(buildDir)) {
		wrench.mkdirSyncRecursive(buildDir, 0755);
  	}
 	// TODO: check if linkSource already exists -> ask for overwrite
	fs.symlink(path.resolve(buildDir), link, function() {
		self.log.info('link created to: ', link);
	});
};

/**
 * Packages theme into a zip file
 * 
 * @param {string} packageLocation
 */
commands.package = function(packageLocation, cb) {

	packageLocation = packageLocation || this.config.get('name');

	// first build the hole thing
	var result = _.bind(commands.build, this, this.config.get('build') + '/build/')();
	var files = _.filter(result, function(file) {
		return file;	
	});

	var self = this;
	var package = path.normalize(packageLocation + '/' + this.config.get('name') + '.zip');
	var packageDir = path.dirname(package);
	var zip = new JSZip();

	if(!fs.existsSync(packageDir)) {
		wrench.mkdirSyncRecursive(packageDir, 0755);
  	}
    
    files.forEach(function(file, index) {
		var data = fs.readFileSync(file, 'utf8');
		var name = path.basename(file);
		zip.file(name, data);
    });

	var data= zip.generate({compression:'DEFLATE'});

	fs.writeFile(package, data, 'base64', function () {
		helper.logChange(package);
    });


};


