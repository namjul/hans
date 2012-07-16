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
var async = require("async");

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
move.functions = function(file, cb) {
	file = file || path.normalize(app.config.get('functions')+'/functions.php');

	if(!fs.existsSync(file)) return;

	var out = this.location + 'functions.php';
	helper.copyFile(file, out, _.bind(function(err) {
		if(err) throw err;
    	if(this.build) helper.logChange(out);
    	if(_.isFunction(cb)) cb(out);
	}, this));
    return out;
};

/*
 * moves template files 
 */
 move.templates = function(file, cb) {

 	var templatesPath = path.normalize(app.config.get('templates'));

	if(!fs.existsSync(templatesPath)) return;

 	// move only file
 	if(file) {
 		if(helper.isDir(file)) return;
		var filename = path.basename(file);
		var out = this.location + filename;
		helper.copyFile(file, out, _.bind(function(err) {
			if(err) throw err;
	    	if(this.build) helper.logChange(out);
    		if(_.isFunction(cb)) cb(out);
		}, this));
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
	  	var fileCount = files.length;
	  	for(var i in files) {
	    	var file = files[i];
	    	var out = path.basename(file);
	    	out = path.join(this.location, out);
	    	out = path.normalize(out);

	    	if(!helper.isDir(file)) {
	    		(function(self, out) {
					helper.copyFile(file, out, function(err){
				    	if(err) throw err;
		    			if(self.build) helper.logChange(out);
		    			fileCount--;
			    		if(_.isFunction(cb) && fileCount == 0) cb(results);
					});
	    		})(this, out)
   			 	results.push(out);
	    	}
	  	}
	  	return results;
 	}
 };

/*
 * moves include files 
 */
 move.includes = function(file, cb) {

 	var includesPath = path.normalize(app.config.get('includes'));
 	var buildIncludesPath = path.join(this.location, path.basename(includesPath));

	if(!fs.existsSync(includesPath)) return;

 	// move only file
 	if(file) {
 		if(helper.isDir(file)) {
			wrench.mkdirSyncRecursive(path.join(buildIncludesPath, file.replace(includesPath, '')), 0755);
 		} else {
	    	var out = path.join(buildIncludesPath, file.replace(includesPath, ''));
			var dir = path.dirname(out);
			wrench.mkdirSyncRecursive(dir, 0755);
			helper.copyFile(file, out, _.bind(function(err) {
		    	if(err) throw err;
	    		if(this.build) helper.logChange(out);
				if(_.isFunction(cb)) cb(out);
			}, this));
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
	  	var fileCount = files.length;
	  	for(var i in files) {
	    	var file = files[i];
	    	var out = file.replace(includesPath, '');
	    	out = path.join(buildIncludesPath, out);
	    	out = path.normalize(out);

	    	if(helper.isDir(file)) {
				wrench.mkdirSyncRecursive(out, 0755);
				if(this.build) helper.logChange(out);
				fileCount--;
			    if(_.isFunction(cb) && fileCount == 0) cb(results);
	    	} else {

				(function(self, out) {
					helper.copyFile(file, out, function(err){
				    	if(err) throw err;
		    			if(self.build) helper.logChange(out);
			    		fileCount--;
			    		if(_.isFunction(cb) && fileCount == 0) cb(results);
					});
	    		})(this, out)

 	  			results.push(out);
	    	}
	  	}	

	  	return results;
 	}
 };

 /*
 * moves asset files 
 */
 move.assets = function(file, cb) {

 	var assetsPath = path.normalize(app.config.get('assets'));
 	var buildAssetsPath = this.location;

	if(!fs.existsSync(assetsPath)) return;

 	// move only file
 	if(file) {
 		if(path.basename(file) === 'screenshot.png') {
 			file = 'screenshot.png';	
 		}
 		if(helper.isDir(file)) {
			wrench.mkdirSyncRecursive(path.join(buildAssetsPath, file.replace(assetsPath, '')), 0755);
 		} else {
	    	var out = path.join(buildAssetsPath, file.replace(assetsPath, ''));
			var dir = path.dirname(out);
			wrench.mkdirSyncRecursive(dir, 0755);
			helper.copyFile(file, out, _.bind(function(err) {
		    	if(err) throw err;
	    		if(this.build) helper.logChange(out);
				if(_.isFunction(cb)) cb(out);
			}, this));
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
	  	var fileCount = files.length;
	  	for(var i in files) {
	    	var file = files[i];
	    	var out = file.replace(assetsPath, '');
 			if(path.basename(file) === 'screenshot.png') {
 				out = 'screenshot.png';
 			}
	    	out = path.join(buildAssetsPath, out);
	    	out = path.normalize(out);

	    	if(helper.isDir(file)) {
				wrench.mkdirSyncRecursive(out, 0755);
				if(this.build) helper.logChange(out);
				fileCount--;
			    if(_.isFunction(cb) && fileCount == 0) cb(results);
	    	} else {

				(function(self, out) {
					helper.copyFile(file, out, function(err){
				    	if(err) throw err;
		    			if(self.build) helper.logChange(out);
			    		fileCount--;
			    		if(_.isFunction(cb) && fileCount == 0) cb(results);
					});
	    		})(this, out)

 	  			results.push(out);
	    	}
	  	}	
	  	return results;
 	}
 };

 /**
  * moves all files
  */
move.all = function(build, cb) {

	this.build = build;

	var self = this;
	var resultPaths = [];

	async.parallel([
	    function(callback){
	    	self.functions(null, function(result) {
	    		callback(null, result);	
	    	});
	    },
	    function(callback){
	    	self.templates(null, function(result) {
	    		callback(null, result);	
	    	});
	    },
	    function(callback){
	    	self.includes(null, function(result) {
	    		callback(null, result);	
	    	});
	    },
	    function(callback){
	    	self.assets(null, function(result) {
	    		callback(null, result);	
	    	});
	    }
	],
	function(err, results){
		resultPaths = resultPaths.concat(results[0], results[1], results[2], results[3]);
		cb(err, resultPaths);
	});

};

