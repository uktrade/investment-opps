'use strict';


var metalsmith = require('metalsmith'),
  markdown = require('metalsmith-markdown'),
  layouts = require('metalsmith-layouts'),
  sass = require('metalsmith-sass'),
  fs = require('fs'),
  swig = require('swig'),
  structureParser = require('./lib/structure-parser'),
  debug = require('debug');


var handle = require('./lib/helpers/error-handler').handle;

build();

/**
 * Main build function. Builds site with content, structure and layouts
 */
function build() {

  createSwigFilters();

  metalsmith(__dirname)
    .source('./node_modules/iigb-beta-content/content')
    .use(markdown())
    .use(structureParser('./node_modules/iigb-beta-structure/structure'))
    .use(layouts({
      engine: 'swig',
      directory: './node_modules/iigb-beta-layout/layouts'
    }))
    .use(sassBuilder())
    .destination('./build')
    .build(function(err) {
      handle(err);
    });
}


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
      .source('./node_modules/iigb-beta-layout/assets')
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

function createSwigFilters() {

  // helper to slugify strings
  swig.setFilter('slug', function(content) {
    var spacesToDashes = content.split(' ').join('-').toLowerCase();
    var removeChars = spacesToDashes.replace(/[^a-zA-Z0-9\- ]/g, '');
    return removeChars;
  });

  // helper to un-slugify strings and sentence case
  swig.setFilter('unslug', function(content) {
    var unslug = content.split('-').join(' ');
    return unslug.charAt(0).toUpperCase() + unslug.substr(1);
  });

  swig.setDefaults({
    cache: false,
    locals: {
      now: function() {
        return new Date();
      }
    }
  });

}