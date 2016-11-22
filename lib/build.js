'use strict';


var metalsmith = require('metalsmith'),
  markdown = require('metalsmith-markdown'),
  layouts = require('metalsmith-layouts'),
  sass = require('metalsmith-sass'),
  assets = require('metalsmith-assets'),
  nunjucks = require('nunjucks'),
  nunjucksDate = require('nunjucks-date'),
  fs = require('fs'),
  path = require('path'),
  structureParser = require('./structure-parser'),
  normalize = path.normalize,
  join = path.join;

/**
 * Helpers
 */
var logger = require('./helpers/logger')('build'),
  debug = logger.debug,
  warn = logger.warn;

build();

/**
 * Main build function. Builds site with content, structure and layouts.
 *
 * Uses layout, content and structure from node_modules by default.
 *
 * To use local project files under same directory with project's folder "dev" parameters needs to be passed in.
 *
 */
function build() {


  var modulesDir = isDev() ? '.' : './node_modules'; //relative to working dir
  var contentsDir = join(modulesDir, 'iigb-beta-content/content');
  var mediaDir = join(modulesDir, 'iigb-beta-content/media');
  var labelsDir = join(contentsDir, '_labels');
  var structureDir = join(modulesDir, 'iigb-beta-structure/structure');
  var layoutDir = 'src';
  var layoutDirAbsolute = join(process.cwd(), layoutDir);


  debug('Content directory: %s', contentsDir);
  debug('Layouts directory: %s', layoutDir);
  debug('Layouts directory: %s', layoutDirAbsolute);
  debug('Structures directory: %s', structureDir);

  configureNunjucks();
  var m = metalsmith(process.cwd())
    .source(contentsDir)
    .use(markdown())
    .use(structureParser({
      structures: structureDir, //structure files dir
      labels: labelsDir //labels file dir
    }))
    .use(layouts({
      engine: 'nunjucks',
      directory: layoutDir + '/templates'
    }))
    .use(sassBuilder())
    .use(assets({
      source: mediaDir,
      destination: './media'
    })).destination('./build')
    .build(function(err) {
      if (err) {
        logger.error(err);
        process.exit(1);
      } else {
        debug('Build finished successfully!');
      }
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
      metalsmith(msmith._directory)
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
          done(err);
        });
    };
  }

  function configureNunjucks() {
    var env = nunjucks.configure(layoutDirAbsolute + '/templates', {
      watch: false
    });

    // helper to slugify strings
    env.addFilter('slug', function(content, language) {
      if ((language || 'us') === 'zh') {
        return content;
      }

      if (!content) {
        return content;
      }

      var spacesToDashes = content.split(' ').join('-').toLowerCase();
      var removeChars = spacesToDashes.replace(/[^a-zA-Z0-9\- ]/g, '');
      return removeChars;
    });

    // helper to un-slugify strings and sentence case
    // env.addFilter('unslug', function(content, language) {
    //   //do not modify chinese language
    //   if ((language || 'us') === 'cn') {
    //     return content;
    //   }
    //   var unslug = content.split('-').join(' ');
    //   return unslug.charAt(0).toUpperCase() + unslug.substr(1);
    // });

    env.addGlobal('now', function() {
      return new Date();
    });

    nunjucksDate.setDefaultFormat('DD MMMM YYYY');
    nunjucksDate.install(env);
  }

  function isDev() {
    return process.argv[2] && process.argv[2] === 'dev';
  }

}
