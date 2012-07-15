/*
 * Wordpress theme development from the CLI.
 * 
 * Samuel Hobl <nam@hobl.at>
 * MIT License.
 */
 
var fs = require("fs");
var app = module.exports = require('flatiron').app;

/** 
 * Load theme config file 
 *
 * TODO: support for comments
 */
var configPlugin = {
    name: 'config-plugin',
    attach: function (options) {
        this.config.file({ file: './config.json' });
    },
    init: function (done) {
        var argv = this.argv;
        var depCommands = ['watch', 'build'];
        if (!fs.existsSync('./config.json') && (depCommands.indexOf(argv._[0]) != -1)) {
            this.log.error('could not find the config file, are you sure you are in the project directory?');
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
    'source': './source',
    'package': './package',

    'js': './source/js/index',
    'adminjs': '',
    'css': './source/css/index',
    'admincss': '',
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
