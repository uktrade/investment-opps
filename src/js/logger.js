var oldConsole = isOldConsole()
bindPollyfill()
forEachPollyfill()
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
    cons().log.apply(null, joinMessages(null, arguments))
  }

  function info() {
    cons().info.apply(null, joinMessages(INFO, arguments))
  }

  function error() {
    cons().error.apply(null, joinMessages(ERROR, arguments))
  }

  function debug() {
    cons().debug.apply(null, joinMessages(DEBUG, arguments))
  }

  function warn() {
    cons().debug.apply(null, joinMessages(WARN, arguments))
  }

  function joinMessages(level, args) {
    var messages = []
    if (printLogLevel && level) {
      messages.push(level)
    }
    messages.push(prefix)
    for (var i in args) {
      var arg = args[i]
      if (oldConsole) {
        pushArg(messages, arg)
      } else {
        messages.push(arg)
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
    log: function() {},
    info: function() {},
    error: function() {},
    debug: function() {},
    warn: function() {}
  }

}
/*eslint-disable  no-console */
function bindPollyfill() {
  // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Function/bind#Compatibility
  if (!Function.prototype.bind) {
    Function.prototype.bind = function(oThis) {
      if (typeof this !== 'function') {
        // closest thing possible to the ECMAScript 5
        // internal IsCallable function
        throw new TypeError('Function.prototype.bind - what is trying to be bound is not callable')
      }

      var aArgs = Array.prototype.slice.call(arguments, 1),
        fToBind = this,
        fNOP = function() {},
        fBound = function() {
          return fToBind.apply(this instanceof fNOP ?
            this :
            oThis,
            aArgs.concat(Array.prototype.slice.call(arguments)))
        }

      if (this.prototype) {
        // Function.prototype doesn't have a prototype property
        fNOP.prototype = this.prototype
      }
      fBound.prototype = new fNOP()
      return fBound
    }
  }
}

function forEachPollyfill() {
  //https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/forEach#Polyfill
  if (!Array.prototype.forEach) {
    Array.prototype.forEach = function(callback /*, thisArg*/ ) {
      var T, k
      if (this == null) {
        throw new TypeError('this is null or not defined')
      }
      var O = Object(this)
      var len = O.length >>> 0
      if (typeof callback !== 'function') {
        throw new TypeError(callback + ' is not a function')
      }
      if (arguments.length > 1) {
        T = arguments[1]
      }
      k = 0
      while (k < len) {
        var kValue
        if (k in O) {
          kValue = O[k]
          callback.call(T, kValue, k, O)
        }
        k++
      }
    }
  }
}

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
