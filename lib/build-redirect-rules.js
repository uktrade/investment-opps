#!/usr/bin/env node

var fs = require('fs')
var path = require('path')
var BUILD_FOLDER = 'build'
var rules = {
  IndexDocument: {
    Suffix: 'index.html'
  },
  ErrorDocument: {
    Key: '404.html'
  },
  RoutingRules: []
}


console.log('Generating redirect rules for s3')
walk(BUILD_FOLDER, processFile)
//write to file
fs.writeFileSync('s3-redirects.json', JSON.stringify(rules,null,4))
rules.RoutingRules.forEach(function(f) {
 console.log(f)
})

function walk(dir, callback) {

  //read directories first to ensure files in deeper leves are first

  var dirs = read(dir)
  dirs.forEach(function(file) {
    walk(file, callback)
  })

  if (dir !== BUILD_FOLDER) {
    var files = read(dir, '404.html')
    files.forEach(callback)
  }
}


/*
 * Read files with given name,
 * if fileName is not given only read directories
 */
function read(dir, fileName) {
  var files = fs.readdirSync(dir)
  return files.map(function(file) {
    return path.join(dir, file)
  }).filter(function(file) {
    // console.log('Filtering' ,files)
    if (fileName) {
      return path.basename(file) === fileName
    } else {
      return fs.statSync(file).isDirectory()
    }
  })
}

function processFile(file) {
  rules.RoutingRules.push(newRedirect(file))
}

function newRedirect(file) {
  var subdomain = process.env.SUBDOMAIN
  var hostname = 'invest.great.gov.uk'
  hostname = (subdomain ? subdomain + '.' : '') + hostname
  var prefix=file.replace(/build\/(.*\/)404.html/, '\$1')
  return {
    Condition: {
      HttpErrorCodeReturnedEquals: '404',
      KeyPrefixEquals: prefix
    },
    Redirect: {
      HostName: hostname,
      Protocol: 'https',
      ReplaceKeyWith: prefix+'404.html'
    }
  }
}
