#!/usr/bin/env node

var Metalsmith = require('metalsmith')
var htmlMinifier = require('metalsmith-html-minifier')
var metadataDirectory = require('metalsmith-metadata-directory')
var layouts = require('metalsmith-layouts')
var markdown = require('metalsmith-markdown')
var pageBuilder = require('metalsmith-page-builder')
var nunjucks = require('nunjucks')
var nunjucksDate = require('nunjucks-date')

var dir = process.cwd()
configureNunjucks()
var metalsmith = Metalsmith(dir)
  .source('node_modules/iigb-beta-content/content')
  .destination('build') // destination directory
  .clean(false)
  .use(metadataDirectory({
    directory: 'src/assets/data_*.json'
  }))
  .use(markdown())
  .use(pageBuilder({
    structures: 'node_modules/iigb-beta-structure/structure',
  }))
  .use(layouts({
    engine: 'nunjucks',
    directory: 'src/templates'
  }))

/*eslint-disable  no-console */
if (process.env.DIT_ENV === 'development') {
  metalsmith.use(htmlMinifier())
}

metalsmith.build(function(err) {
    if (err) {
      /*eslint-disable  no-console */
      console.error(err.stack)
      process.exit(1)
    } else {
      console.log('Successfully built to %s', 'build')
    }
  })
  /*eslint-enable  no-console */

function configureNunjucks() {
  var env = nunjucks.configure(
    ['./src/templates'], {
      watch: false
    }
  )

  env.addFilter('slug', require('./nunjucks/slug'))
  env.addFilter('null', require('./nunjucks/null'))
  env.addGlobal('now', require('./nunjucks/now'))

  nunjucksDate.setDefaultFormat('DD MMMM YYYY')
  nunjucksDate.install(env)
}
