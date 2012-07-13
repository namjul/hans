/**
 * Dependencies.
 */
var fs = require("fs");
var util = require("util");
var path = require("path");
var _ = require("underscore");
var wrench = require('wrench');
var helper = require("./helper");
var app = require("./app");

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
	file = file || path.normalize(app.config.get('functions')+'/functions.php');

	if(!fs.existsSync(file)) return;

	var out = this.location + 'functions.php';
	var data = fs.readFileSync(file, 'utf8');
    fs.writeFileSync(out, data);
    if(this.build) helper.logChange(out);
    return out;
};

/*
 * moves template files 
 */
 move.templates = function(file) {

 	var templatesPath = path.normalize(app.config.get('templates'));

	if(!fs.existsSync(templatesPath)) return;

 	// move only file
 	if(file) {
 		if(helper.isDir(file)) return;
		var data = fs.readFileSync(file, 'utf8');
		var filename = path.basename(file);
		var out = this.location + filename;
    	fs.writeFileSync(out, data);
    	if(this.build) helper.logChange(out);
    	return out;

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

	  	var results = [];
	  	for(var i in files) {
	    	var file = files[i];
	    	var out = path.basename(file);
	    	out = path.join(this.location, out);
	    	out = path.normalize(out);

	    	if(!helper.isDir(file)) {
	      		var data = fs.readFileSync(file, 'utf8');
	      		fs.writeFileSync(out, data);
   			 	if(this.build) helper.logChange(out);
   			 	results.push(out);
	    	}
	  	}
	  	return results;
 	}
 };

/*
 * moves include files 
 */
 move.includes = function(file) {

 	var includesPath = path.normalize(app.config.get('includes'));
 	var buildIncludesPath = path.join(this.location, path.basename(includesPath));

	if(!fs.existsSync(includesPath)) return;

 	// move only file
 	if(file) {
 		if(helper.isDir(file)) {
			wrench.mkdirSyncRecursive(path.join(buildIncludesPath, file.replace(includesPath, '')), 0755);
 		} else {
			var data = fs.readFileSync(file, 'utf8');
	    	var out = path.join(buildIncludesPath, file.replace(includesPath, ''));
			var dir = path.dirname(out);
			wrench.mkdirSyncRecursive(dir, 0755);
	    	fs.writeFileSync(out, data);
   			if(this.build) helper.logChange(out);
   			return out;
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

		if(!fs.existsSync(buildIncludesPath)) {
			wrench.mkdirSyncRecursive(buildIncludesPath, 0755);
		}

		var results = [];
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
 	  			if(this.build) helper.logChange(out);
 	  			results.push(out);
	    	}
	  	}	

	  	return results;
 	}
 };

 /*
 * moves asset files 
 */
 move.assets = function(file) {

 	var assetsPath = path.normalize(app.config.get('assets'));
 	var buildAssetsPath = path.join(this.location, path.basename(assetsPath));

	if(!fs.existsSync(assetsPath)) return;

 	// move only file
 	if(file) {
 		if(helper.isDir(file)) {
			wrench.mkdirSyncRecursive(path.join(buildAssetsPath, file.replace(assetsPath, '')), 0755);
 		} else {
			var data = fs.readFileSync(file, 'utf8');
	    	var out = path.join(buildAssetsPath, file.replace(assetsPath, ''));
			var dir = path.dirname(out);
			wrench.mkdirSyncRecursive(dir, 0755);
	    	fs.writeFileSync(out, data);
	    	if(this.build) helper.logChange(out);
   			return out;
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

	  	if(!fs.existsSync(buildAssetsPath)) {
			wrench.mkdirSyncRecursive(buildAssetsPath, 0755);
		}

		var results = [];
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
	      		if(this.build) helper.logChange(out);
 	  			results.push(out);
	    	}
	  	}	
	  	return results;
 	}
 };

 /**
  * moves all files
  */
move.all = function(build) {
	this.build = build;

	var resultPaths = [];

	resultPaths.push(this.functions());
	resultPaths = resultPaths.concat(this.templates());
	resultPaths = resultPaths.concat(this.includes());
	resultPaths = resultPaths.concat(this.assets());

	return resultPaths;

};

