'use strict';


var metalsmith = require('metalsmith'),
  markdown = require('metalsmith-markdown'),
  layouts = require('metalsmith-layouts'),
  sass = require('metalsmith-sass'),
  fs = require('fs'),
  swig = require('swig'),
  structureParser = require('./lib/structure-parser');


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
    .use(sass({
      file: 'scss/main.scss',
      outputDir: './assets/css',
      outputStyle: 'compressed'
    }))
    .use(sass({
      file: 'scss/main-ie8.scss',
      outputDir: './assets/css',
      outputStyle: 'compressed'
    }))
    .use(sass({
      file: 'scss/main-ie9.scss',
      outputDir: './assets/css',
      outputStyle: 'compressed'
    }))
    .destination('./build')
    .build(function(err) {
      handle(err);
    });
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