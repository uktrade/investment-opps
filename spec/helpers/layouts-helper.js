'use strict'

var fs = require('fs')
var path = require('path')
var cmsTags = require('iigb-cms-tags')
var nunjucks = require('nunjucks')

var LAYOUTS_DIR = path.join(process.cwd(), 'src/templates')

global.layout = load
global.loopLayouts = loopLayouts
global.parseCmsTags = parseCmsTags
global.render = render
configureNunjucks()


function load(layoutName) {

  var file = path.join(LAYOUTS_DIR, layoutName)
  return fs.readFileSync(file, 'utf-8').toString()
}

function parseCmsTags(html) {
  return cmsTags.parse(html)
}

function loopLayouts(loop) {
  var files = fs.readdirSync(LAYOUTS_DIR)
  var file
  for (var i = 0; i < files.length; i++) {
    file = files[i]
    if (path.extname(file) === '.html') {
      loop(file)
    }
  }
}

function render(layoutName) {
  return nunjucks.render(layoutName)
}


function configureNunjucks() {
  var env = nunjucks.configure(LAYOUTS_DIR, {
    watch: false
  })

  // content doesn't matter for test purposes
  env.addFilter('slug', function(content, language) {
    return ''
  })

  env.addFilter('date', function(content, language) {
    return ''
  })

  env.addGlobal('now', function() {
    return new Date()
  })

}
