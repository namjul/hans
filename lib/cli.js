/**
 * Dependencies.
 */
var flatiron = require("flatiron");
var path = require("path");
var app = module.exports = require('./app');
var error = console.error;

/*
 * TODO: packages theme as zip, wordpress php content, livereload, bedder info outputs, theme screenshot image
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
  ]
});

// Load commands
var commands = require('./commands');

app.commands.create = commands.create;
app.commands.build = commands.build;
app.commands.watch = commands.watch;
app.commands.link = commands.link;

/**
 * Handles exceptions.
 */
process.on('uncaughtException', function(err) {
  app.log.error(err);
  process.exit(1);
});