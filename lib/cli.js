/**
 * Dependencies.
 */
var flatiron = require("flatiron");
var path = require("path");
var app = module.exports = require('./app');

/*
 * TODO: wordpress php content, livereload, bedder info outputs, theme screenshot image
 */


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
    '       hans link /wordpress/wp-content/themes/yourtheme - links to your wordpress theme folder.',
    '       hans watch <debug> - watched for file changes.',
    '       hans build <path> - Builds a working wordpress theme.',
    '       hans package - creates a zipt file of your wordpress theme.',
    '       version version      - Lib version.',
    '',
    'Author: Samuel Hobl <nam@hobl.at>',
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