var logger=require('./logger')('GEO Location')
var debug=logger.debug
var info=logger.info
module.exports=geoLocation

function geoLocation() {
  var is_root = location.pathname == '/'
  if (is_root) {
    info('Checking location...')
    return checkGeoLocation()
  } else {
    return $.Deferred().resolve(false).promise()
  }

  function checkGeoLocation() {
    return $.getJSON('//freegeoip.net/json/', function() {})
      .done(function(data) {
        debug('Resolved country code as ', data.country_code)
        return getRedirectPath(data.country_code)
      })
  }

  function getRedirectPath(countryCode) {
    //TODO move lookup table to more stable location
    return $.getJSON(
      'https://cdn.rawgit.com/uktrade/iigb-beta-structure/develop/redirects/ip_redirects.json'
    )
      .done(function(data) {
        debug('Redirecting to', data.country_code)
        doRedirect(data[countryCode])
        return true
      })
  }

  function doRedirect(redirectLocation) {
    if (redirectLocation == undefined || redirectLocation == '') {
      debug('Location code is empty, redirecting to /int')
      window.location.pathname = '/int/'
    } else {
      window.location.pathname = redirectLocation
    }
  }
}
