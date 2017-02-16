var logger = require('./logger')('GEO Location')
var debug = logger.debug
var info = logger.info
module.exports = geoLocation

/**
 * Resolves geo location of current user and redirects to appropriate language
 * page
 *
 * Only redirects if root page, otherwise no redirect happens
 **/

function geoLocation() {
  info('Checking location...')
  return checkGeoLocation()

  function checkGeoLocation() {
    return $.ajax({
      url: '//freegeoip.net/json/',
      type: 'GET',
      dataType: 'jsonp',
    }).then(function(data) {
      debug('Resolved country code as ', data.country_code)
      return getRedirectPath(data.country_code)
    })
  }

  function getRedirectPath(countryCode) {
    var build=document.iigbBuild ? document.iigbBuild + '/':''
    var ipRedirectUrl='/assets/' + build+ 'ip_redirects.json'
    return $.getJSON( ipRedirectUrl)
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
