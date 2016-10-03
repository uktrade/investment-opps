'use strict';


var metalsmith = require('metalsmith'),
  markdown = require('metalsmith-markdown'),
  layouts = require('metalsmith-layouts'),
  sass = require('metalsmith-sass'),
  nunjucks = require('nunjucks'),
  env = new nunjucks.Environment(),
  fs = require('fs'),
  structureParser = require('./lib/structure-parser'),
  debug = require('debug')('build');

var handle = require('./lib/helpers/error-handler').handle;

build();

/**
 * Main build function. Builds site with content, structure and layouts.
 *
 * Uses layout, content and structure from node_modules by default.
 *
 * To use local project files under same directory with project's folder "dev" parameters needs to be passed in.
 */
function build() {

  var baseDir = isDev() ? '../' : './node_modules/';
  var contentsDir = baseDir + 'iigb-beta-content/content';
  var structureDir = baseDir + 'iigb-beta-structure/structure';
  var layoutDir = baseDir + 'iigb-beta-layout';

  debug('Content files: ' + contentsDir);
  debug('Structure files: ' + structureDir);
  debug('Layout files: ' + layoutDir);

  configureNunjucks();

  metalsmith(__dirname)
    .source(contentsDir)
    .use(markdown())
    .use(structureParser(structureDir))
    .use(layouts({
      engine: 'nunjucks',
      directory: layoutDir + '/src/templates'
    }))
    .use(sassBuilder())
    .destination('./build')
    .build(function(err) {
      handle(err);
    });



  /**
   * Simple Metalsmith plugin to trigger a new Metalsmith instance to build project sass files.
   *
   * Metalsmith sass plugin renders files relative to Metalsmith source directory, hence it was not possible to
   * use same Metalsmith pipe for sass builds.
   *
   * @return {Function} build project sass files
   */
  function sassBuilder() {

    return function buildSass(contents, msmith, done) {

      metalsmith(__dirname)
        .source(layoutDir + '/assets')
        .use(sass({
          file: 'scss/main.scss',
          outputDir: './css',
          outputStyle: 'compressed'
        }))
        .use(sass({
          file: 'scss/main-ie8.scss',
          outputDir: './css',
          outputStyle: 'compressed'
        }))
        .use(sass({
          file: 'scss/main-ie9.scss',
          outputDir: './css',
          outputStyle: 'compressed'
        }))
        .destination('./build/assets')
        .build(function(err) {
          handle(err);
          done();
        });
    };
  }

  function configureNunjucks() {
    nunjucks.configure(layoutDir + '/src/templates', {
      watch: false
    });


    var env = new nunjucks.Environment();

    // helper to slugify strings
    env.addFilter('slug', function(content) {
      var spacesToDashes = content.split(' ').join('-').toLowerCase();
      var removeChars = spacesToDashes.replace(/[^a-zA-Z0-9\- ]/g, '');
      return removeChars;
    });

    // helper to un-slugify strings and sentence case
    env.addFilter('unslug', function(content) {
      var unslug = content.split('-').join(' ');
      return unslug.charAt(0).toUpperCase() + unslug.substr(1);
    });


  }

  function isDev() {
    return process.argv[2] && process.argv[2] === 'dev';
  }

}