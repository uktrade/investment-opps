'use strict';

var deb = require('debug');

var warn = deb('WARN');
var error = deb('ERROR');
// set to log errors via console.error
// (stderr, which is actually the default with npm debug library)
error.log = console.error.bind(console);
// set to log warnings via console.warn
warn.log = console.warn.bind(console);
module.exports = Logger;


/**
 * Creates a new logger for given library name allowing warn and debug and error level logs.
 *
 * All logger names are prefixed with iigb:
 *
 * @param {String} name name of the library doing logging
 */
function Logger(name) {
  var debug = deb(name);
  // set all output to go via console.info
  // overrides all per-namespace log settings
  debug.log = console.info.bind(console);

  return {
    debug: debug,
    warn: warn,
    error: error
  };
}