/**
 * Dependencies.
 */
var fs = require("fs");
var app = module.exports = require('flatiron').app;
var helper = require("./helper");

/** 
 * Load theme config file 
 */
var configPlugin = {
    name: 'config-plugin',
    init: function (done) {

      var argv = this.argv;
      var exclCommands = ['create'];

      if ((exclCommands.indexOf(argv._[0]) == -1)) {
        if(fs.existsSync('./config.json')) {
          var data = fs.readFileSync('./config.json', 'utf-8');
          this.config.overrides(JSON.parse(helper.removeComments(data)));
          done();
        } else {
          done(new Error("could not find the config file, are you sure you are in the project directory?")) 
        }
      } else {
        done();
      }
    }
};
app.use(configPlugin);

/**
 * Set Defaults
 */
app.config.defaults({

    'build': './.hans',

    'js': './source/js/index',
    'css': './source/css/index',
    'adminjs': './source/js/admin/index',
    'admincss': './source/css/admin/index',
    'templates': './source/templates',
    'includes': './source/includes',
    'assets': './source/assets',
    'functions': './source/functions',

    'jslibs': [],
    'csslibs': [],
    'outputJs': 'javascripts',
    'linkPath': '',
    'minify': false,
    'livereload': false
});


