/**
 * Dependencies.
 */
var fs = require("fs");
var util = require("util");
var path = require("path");
var _ = require("underscore");
var wrench = require('wrench');
var helper = require("./helper");
var app = require("./index");

/**
 * Move.
 * 
 * @type {Object}
 */
var move = module.exports;

/**
 * root location for build
 */
move.location = app.config.get('build') + '/build/';

/**
 * moves the functions.php file
 */
move.functions = function(file) {
	file = file || app.config.get('functions')+'/functions.php';
	var data = fs.readFileSync(file, 'utf8');
    fs.writeFileSync(this.location + 'functions.php', data);
	app.log.info('function.php changed, moved it over');
};

/*
 * moves template files 
 */
 move.templates = function(file) {

 	var templatesPath = app.config.get('templates');

 	// move only file
 	if(file) {
 		if(helper.isDir(file)) return;
		var data = fs.readFileSync(file, 'utf8');
		var filename = path.basename(file);
    	fs.writeFileSync(this.location + filename, data);

    // move whole dir
 	} else {

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
		    next(templatesPath);
		    return files;
	  	}();

	  	for(var i in files) {
	    	var file = files[i];
	    	var out = path.basename(file);
	    	out = path.join(this.location, out);
	    	out = path.normalize(out);

	    	if(!helper.isDir(file)) {
	      		var data = fs.readFileSync(file, 'utf8');
	      		fs.writeFileSync(out, data);
	    	}
	  	}
 	}

	app.log.info('templates changed, moved it over');
 };

/*
 * moves include files 
 */
 move.includes = function(file) {

 	var includesPath = app.config.get('includes');
 	var buildIncludesPath = path.join(this.location, path.basename(includesPath));

 	// move only file
 	if(file) {
 		if(helper.isDir(file)) {
			wrench.mkdirSyncRecursive(path.join(buildIncludesPath, file.replace(path.normalize(includesPath), '')), 0755);
 		} else {
			var data = fs.readFileSync(file, 'utf8');
	    	var out = path.join(buildIncludesPath, file.replace(path.normalize(includesPath), ''));
			var dir = path.dirname(out);
			wrench.mkdirSyncRecursive(dir, 0755);
	    	fs.writeFileSync(out, data);
 		}
    // move whole dir
 	} else {

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
		    next(includesPath);
		    return files;
	  	}();

		if(!path.existsSync(buildIncludesPath)) {
			wrench.mkdirSyncRecursive(buildIncludesPath, 0755);
		}

	  	for(var i in files) {
	    	var file = files[i];
	    	var out = file.replace(includesPath, '');
	    	out = path.join(buildIncludesPath, out);
	    	out = path.normalize(out);

	    	if(helper.isDir(file)) {
				wrench.mkdirSyncRecursive(out, 0755);
	    	} else {
	      		var data = fs.readFileSync(file, 'utf8');
	      		fs.writeFileSync(out, data);
	    	}
	  	}	

 	}

	app.log.info('includes changed, moved it over');
 };

 /*
 * moves asset files 
 */
 move.assets = function(file) {

 	var assetsPath = app.config.get('assets');
 	var buildAssetsPath = path.join(this.location, path.basename(assetsPath));

 	// move only file
 	if(file) {
 		if(helper.isDir(file)) {
			wrench.mkdirSyncRecursive(path.join(buildAssetsPath, file.replace(path.normalize(assetsPath), '')), 0755);
 		} else {
			var data = fs.readFileSync(file, 'utf8');
	    	var out = path.join(buildAssetsPath, file.replace(path.normalize(assetsPath), ''));
			var dir = path.dirname(out);
			wrench.mkdirSyncRecursive(dir, 0755);
	    	fs.writeFileSync(out, data);
 		}
    // move whole dir
 	} else {

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
		    next(assetsPath);
		    return files;
	  	}();

	  	if(!path.existsSync(buildAssetsPath)) {
			wrench.mkdirSyncRecursive(buildAssetsPath, 0755);
		}

	  	for(var i in files) {
	    	var file = files[i];
	    	var out = file.replace(assetsPath, '');
	    	out = path.join(buildAssetsPath, out);
	    	out = path.normalize(out);

	    	if(helper.isDir(file)) {
				wrench.mkdirSyncRecursive(out, 0755);
	    	} else {
	      		var data = fs.readFileSync(file, 'utf8');
	      		fs.writeFileSync(out, data);
	    	}
	  	}	
 	}

	app.log.info('assets changed, moved it over');

 };

 /**
  * moves all files
  */
move.all = function(location) {

	if(location) {
		this.location = location;
	}
	this.functions();
	this.templates();
	this.includes();
	this.assets();
};