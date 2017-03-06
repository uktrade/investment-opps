#!/usr/bin/env node
var Jasmine = require('jasmine')
var JasmineConsoleReporter = require('jasmine-console-reporter')
var reporter = new JasmineConsoleReporter({
  colors: 1, // (0|false)|(1|true)|2
  cleanStack: 1, // (0|false)|(1|true)|2|3
  verbosity: 4, // (0|false)|1|2|(3|true)|4
  listStyle: 'indent', // "flat"|"indent"
  activity: false
})
run()

function run() {
  var jasmine = new Jasmine()
  /* jshint ignore:start */
  jasmine.loadConfig({
    spec_dir: 'spec',
    spec_files: [
      '**/*.[sS]pec.js',
    ],
    helpers: [
      'helpers/**/*.js'
    ]
  })

  jasmine.addReporter(reporter)

  jasmine.execute()
  /* jshint ignore:end*/

}
