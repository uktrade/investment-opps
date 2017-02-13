module.exports=Logger


function Logger(_name) {

  var prefix
  name(_name)
  var printLogLevel=false
  var ERROR= '[ERROR]'
  var INFO= '[INFO]'
  var DEBUG= '[DEBUG]'
  var WARN= '[WARN]'

  return {
    name:name,
    log: log,
    info: info,
    error: error,
    debug: debug,
    warn: warn
  }

  //set name
  function name(name) {
    prefix=name ? ('[' + name + ']') : ''
  }

  function log() {
    cons().log.apply(null, joinMessages(null,arguments))
  }

  function info() {
    cons().info.apply(null, joinMessages(INFO,arguments))
  }

  function error() {
    cons().error.apply(null,joinMessages(ERROR,arguments))
  }

  function debug() {
    cons().debug.apply(null,joinMessages(DEBUG,arguments))
  }

  function warn() {
    cons().debug.apply(null,joinMessages(WARN,arguments))
  }

  function joinMessages(level,args) {
    var messages=[]
    if (printLogLevel && level) {
      messages.push(level)
    }
    messages.push(prefix)
    for (var i in args) {
      messages.push(args[i])
    }
    return messages
  }

  //Check and return console, on IE8 and IE9 console is only available
  //when debugging is enabled. That's why console should be resolved
  //dynamically for each call
  function cons() {
    if (typeof console === 'undefined') {
      return {

      }
    } else {
      return console
    }

  }
}
