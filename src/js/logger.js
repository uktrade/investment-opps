var oldConsole = isOldConsole()
consolePollyfill()
module.exports = Logger

function Logger(_name) {

  var prefix
  name(_name)
  var printLogLevel = false
  var ERROR = '[ERROR]'
  var INFO = '[INFO]'
  var DEBUG = '[DEBUG]'
  var WARN = '[WARN]'

  if (document.iigbBuild === '') {
    return {
      name: name,
      log: log,
      info: info,
      error: error,
      debug: debug,
      warn: warn
    }
  } else {
    return mockConsole()
  }

  //set name
  function name(name) {
    prefix = name ? ('[' + name + ']') : ''
  }

  function log() {
    cons().log.apply(console, joinMessages(null, arguments))
  }

  function info() {
    cons().info.apply(console, joinMessages(INFO, arguments))
  }

  function error() {
    cons().error.apply(console, joinMessages(ERROR, arguments))
  }

  function debug() {
    var con=cons()
    if(con.debug) {
      cons().debug.apply(console, joinMessages(DEBUG, arguments))
    } else (
      cons().log.apply(console, joinMessages(DEBUG, arguments))
    )
  }

  function warn() {
    cons().debug.apply(console, joinMessages(WARN, arguments))
  }

  function joinMessages(level, args) {
    var messages = []
    if (printLogLevel && level) {
      messages.push(level)
    }
    messages.push(prefix)
    if (args) {
      for (var i = 0, len = args.length; i < len; i++) {
        var arg = args[i]
        if (oldConsole) {
          pushArg(messages, arg)
        } else {
          messages.push(arg)
        }
      }
    }
    return messages
  }

  function pushArg(arr, arg) {
    if (!arg) {
      arr.push(arg)
    } else if (arg.html) {
      if (arg[0]) {
        arr.push(arg[0].outerHTML)
      }
    } else if (typeof arg === 'object') {
      arr.push(JSON.stringify(arg))
    } else {
      arr.push(arg)
    }
  }

  //Check and return console, on IE8 and IE9 console is only available
  //when debugging is enabled. That's why console should be resolved
  //dynamically for each call
  function cons() {
    if (typeof console === 'undefined') {
      return mockConsole()
    } else {
      return console
    }

  }
}

function mockConsole() {
  return {
    name: function() {},
    log: function() {},
    info: function() {},
    error: function() {},
    debug: function() {},
    warn: function() {}
  }

}
/*eslint-disable  no-console */

function consolePollyfill() {
  // http://stackoverflow.com/questions/5538972/console-log-apply-not-working-in-ie9
  if (Function.prototype.bind && oldConsole) {
    ['log', 'debug', 'info', 'warn', 'error', 'assert',
      'dir', 'clear', 'profile', 'profileEnd'
    ]
    .forEach(function(method) {
      if (method === 'debug') {
        console['debug'] = this.bind(console['log'], console)
      } else {
        console[method] = this.bind(console[method], console)
      }
    }, Function.prototype.call)
  }
}


function isOldConsole() {
  return window.console && typeof console.log == 'object'
}

/*eslint-enable  no-console */
