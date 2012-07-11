/**
 * Dependencies.
 */
var flatiron = require("flatiron");
var path = require("path");

/**
 * Application.
 *
 * @type {Object}
 */
var app = module.exports = flatiron.app;

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
        if (!path.existsSync('./config.json') && (depCommands.indexOf(argv._[0]) != -1)) {
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

    'js': './source/js/index',
    'css': './source/css/index',
    'templates': './source/templates',
    'includes': './source/includes',
    'assets': './source/assets',
    'functions': './source/functions',

    'libs': [],
    'outputJs': 'javascripts',
    'compress': false,
    'minify': true
});

// Expose CLI commands using `flatiron-cli-version`
app.use(require('flatiron-cli-version'));

// Configure the Application to be a CLI app with
app.use(flatiron.plugins.cli, {
  source: path.join(__dirname, 'commands'),
  usage: [
    '',
    'hans - Wordpress Themes development in the cli',
    '',
    'Usage:',
    '',
    '       hans create your_theme - Creates a new wordpress theme project.',
    '       hans link /wordpress/wp-content/themes/yourtheme- links to your wordpress theme folder.',
    '       hans watch - watched for file changes.',
    '       hans build - Builds a working wordpress theme.',
    '       hans package - creates a zipt file of your wordpress theme.',
    '       todo version      - Lib version.',
    '',
    'Author: Samuel Hobl <nam@hobl.at>',
    ''
  ]
});

// Load commands
var commands = require('./commands');

app.commands.create = commands.create;
app.commands.build = commands.build;
app.commands.watch = commands.watch;
app.commands.link = commands.link;
