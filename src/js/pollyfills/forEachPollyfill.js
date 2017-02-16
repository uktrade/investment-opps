module.exports = {}

fill()

function fill() {
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
