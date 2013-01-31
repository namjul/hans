/**
 * Dependencies.
 */
var flatiron = require("flatiron");
var path = require("path");
var app = module.exports = require('./app');
var colors = require('colors');


// Setup `hans` to use `pkginfo` to expose version
require('pkginfo')(module, 'name', 'version');

// Configure the Application to be a CLI app with
app.use(flatiron.plugins.cli, {
  version: true,
  source: path.join(__dirname, 'commands'),
  usage: [
    '',
    //'                           __'.blue,
    //'           |__|  /\\  |\\ | |__'.blue,
    //'           |  | /  \\ | \\|  __|'.blue,

    '                          _'.blue,
    '           |__   __  __  |_ '.blue,
    '           |  | |__| | |  _|'.blue,
    '',
    '',
    'hanS - Wordpress Themes development in the cli',
    '',
    'Usage:'.blue.bold.underline,
    '',
    '     Creates a new wordpress theme project.'.blue,
    '       hans create your_theme_name',
    '     Creates a symlink to your wordpress theme folder.'.blue,
    '       hans link </wordpress/wp-content/themes/yourtheme>',
    '     Watched for file changes compiles to working wordpress theme.'.blue,
    '       hans watch',
    '     Builds a working wordpress theme.'.blue,
    '       hans build <path>',
    '     Creates a zip file of your wordpress theme.'.blue,
    '       hans package <path>',
    '',
    'Author: Samuel Hobl',
    ''
  ],
  argv: {
    minify: {
      alias: 'm',
      description: 'minifies css and js',
      string: false
    },
    livereload: {
      alias: 'l',
      description: 'activates livereload',
      string: false 
    },
     version: {
      alias: 'v',
      description: 'print hans version and exit',
      string: false 
    }
  }
});

// Load commands
var commands = require('./commands');

app.commands.create = app.commands.c = commands.create;
app.commands.build = app.commands.b = commands.build;
app.commands.watch = app.commands.w = commands.watch;
app.commands.link = app.commands.l = commands.link;
app.commands.package = app.commands.p = commands.package;

/**
 * handles exceptions.
 */
process.on('uncaughtexception', function(err) {
  app.log.error(err);
  process.exit(1);
});

app.init(function (err) {
  if (err) {
    app.log.error(err.message);
    return process.exit(1);
  }
});
