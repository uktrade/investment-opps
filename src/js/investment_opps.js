module.exports = {
  init: init
}

var logger = require('./logger')('investment opps')
var debug = logger.debug
var error = logger.error
var _assets = document.iigbBuild ? '/assets/' + document.iigbBuild + '/' : '/assets/'
var TAFFY = require('taffydb').taffy

function init() {
  var container = $('#investment-opps-container')
  if (container.length === 0) {
    return
  }
  debug('Found investment opps container, initialising')
  InvestmentOpps(container)
}

function InvestmentOpps(container) {

  var dataMain //main data
  var filteredData
  var map
  var region // active region

  //elements
  var bodyHeight = $('body').height()
  var bodyWidth = $('body').width()
  var businessFilter = container.find('#significant-businesses')
  var centresFilter = container.find('#innovation-centres')
  var chooseInd = container.find('#choose-industry')
  var closeRegion = container.find('#close')
  var clusters = container.find('#clusters')
  var clustersList = container.find('#notable-clusters')
  var details = container.find('#sidebar-details')
  var filters = container.find('#filters')
  var goBtn = container.find('#go-btn')
  var instructions = container.find('#form-instructions')
  var mapContainer = container.find('#map-container')
  var midlandsEngine = container.find('#midlands-engine')
  var mobile
  var northernPowerhouse = container.find('#northern-powerhouse')
  var regenerationOpps = container.find('#regeneration-opps')
  var regionSelector = container.find('#region-selector')
  var sectorLink = container.find('#sector-link')
  var sectorSelector = container.find('#sector-selector')
  var zonesFilter = container.find('#enterprise-zones')

  checkMobile(bodyWidth)


  sectorLink.hide()
  regenerationOpps.hide()
  clusters.hide()
  northernPowerhouse.hide()
  midlandsEngine.hide()

  filters.hide()
  details.hide()
  initMap()
    .then(function() {
      loadData().then(function() {
        filter({
          data: {
            sector: false
          }
        })
        checkHash()
      })
      watch()
      close()
      goToMap()
    })

  function initMap() {
    return require('./map')(container.find('#map'))
      .then(function(_map) {
        map = _map
        map.onSelect(filterRegion)
        if (mobile) {
          mapContainer.detach().insertAfter('#sidebar')
        }
      })
  }

  function loadData() {
    var file = 'data_points_sector.json'
    return fetch(file)
      .then(function(list) {
        dataMain = TAFFY(list)
        return list
      })
  }

  function checkHash() {
    var reIndHash = /industry=(.*)/
    var reRegHash = /&region=(.*)/
    var hash = window.location.hash.substr(1)
    var industryHash = hash.replace(reIndHash, '$1')
    var region
    var hashHasRegion = /&region/.test(hash)
    if (hashHasRegion) {
      region = hash.match(reRegHash, '$1')[1]
      industryHash = hash.replace(reIndHash, '$1').split('&')[0]
    }
    if (industryHash) {
      var industry = industryHash.split('-').join(' ')
      sectorSelector.val(industry)
      if (!region) {
        filter({
          data: {
            sector: false
          }
        })
      }
    }
    if (region) {
      map.selectRegion(region)
      filterRegion(region)
    }
  }

  function watch() {
    sectorSelector
      .change({
        sector: true
      }, changeSector)
    regionSelector.change(changeRegion)
    businessFilter.change(function() {
      sendGAFilterEvent('businesses',businessFilter.is(':checked'))
      filterChanged()
    })
    centresFilter.change(function() {
      sendGAFilterEvent('hubs',centresFilter.is(':checked'))
      filterChanged()
    })
    zonesFilter.change(function() {
      sendGAFilterEvent('incentives',zonesFilter.is(':checked'))
      filterChanged()
    })
  }


  function sendGAFilterEvent(filter, value) {
    debug('Sending GA event', filter,value)
    dataLayer.push({
      'value': value,
      'event': filter + '-filter'
    })
  }

  function close() {
    closeRegion.click(function() {
      filterRegion()
      map.selectRegion()
    })
  }

  function goToMap() {
    goBtn.click(function() {
      $('html, body').animate({
        scrollTop: $('#map').offset().top
      }, 750)
    })
  }

  function changeSector(event) {
    var industry = sectorSelector.val()
    //push to GA
    dataLayer.push({
      'industry': industry,
      'event': 'industry-change'
    })
    if (industry && industry !== '') {
      var selected = $('option:selected', this)
      var indHash = industry.split(' ').join('-')
      var hash = window.location.hash
      var hashHasRegion = /&region/.test(hash)
      var region
      if (hashHasRegion) {
        region = hash.split('&')[1]
        window.location.hash = 'industry=' + indHash + '&' + region
      } else {
        window.location.hash = 'industry=' + indHash
      }
      sectorLink.attr('href', selected.data('link'))
      sectorLink.show()
    } else {
      sectorLink.hide()
    }
    filter(event)
  }

  function changeRegion() {
    var name = regionSelector.val()
    filterRegion(name)
    map.selectRegion(name)
  }

  function filterRegion(name) {
    //push to GA
    dataLayer.push({
      'region': name,
      'event': 'region-change'
    })
    northernPowerhouse.hide()
    midlandsEngine.hide()
    var hash = window.location.hash
    var hashHasRegion = /&region/.test(hash)
    var hashEmptyRegion = hash.split('&')[0]
    if (name) {
      if (hashHasRegion) {
        window.location.hash = hashEmptyRegion + '&region=' + name
      } else {
        window.location.hash = hash + '&region=' + name
      }
      if (name === 'Yorkshire and The Humber' ||
        name === 'North West England' ||
        name === 'North East England'
      ) {
        northernPowerhouse.show()
        regenerationOpps.show()
      } else if (name === 'East Midlands' || name === 'West Midlands') {
        midlandsEngine.show()
        regenerationOpps.show()
      } else {
        regenerationOpps.hide()
      }
    } else {
      window.location.hash = hashEmptyRegion
      regenerationOpps.hide()
    }
    debug('region: ', name)
    if (name) {
      region = name
      if (mobile) {
        details.show()
        $('html, body').animate({
          scrollTop: $('#close').offset().top
        }, 500)
      } else {
        details.show(750)
      }
    } else {
      details.hide(350)
      region = null
      if (mobile) {
        $('html, body').animate({
          scrollTop: $('#map').offset().top
        }, 50)
      }
    }
    regionSelector.val(name)
    filter({
      data: {
        sector: false
      }
    })
  }


  function filter(events) {
    var industry = sectorSelector.val()
    var sector = events.data.sector
    if (!industry) {
      filteredData = TAFFY([])()
      render()
      return
    }
    var _filter = {
      industry: sectorSelector.val()
    }
    if (mobile && sector) {
      filters.show(50)
      $('html, body').animate({
        scrollTop: $('#filters').offset().top
      }, 750)
    }
    if (region) {
      _filter.region = region
    }
    filters.show(750)
    debug('Filtering data by', _filter)
    filteredData = dataMain(_filter)
    render()
    updateNotableClusters(region)
  }

  function getFilters() {
    return {
      businesses: businessFilter.is(':checked'),
      centres: centresFilter.is(':checked'),
      zones: zonesFilter.is(':checked'),
    }
  }

  function filterChanged() {
    map.refreshFilter(getFilters())
  }

  function render() {
    map.refresh(filteredData.get(), getFilters())
  }

  function updateNotableClusters(region) {
    clustersList.empty()
    clusters.hide()
    if (!region) {
      return
    }
    var list = filteredData.order('businesses desc').limit(3).get()
    debug('Notable clusters are:', list)
    $.each(list, function(index, cluster) {
      clustersList.append($('<li>').html(cluster.name))
    })

    debug('Cluster length *****', clustersList, clustersList.length)
    if (clustersList.length > 0) {
      clusters.show()
    }
  }

  function fetch(url) {
    debug('Fetching data', url)
    return $.getJSON(_assets + url)
      .fail(fail)
  }

  function fail(err) {
    error('Error:', err)
  }

  function checkMobile(width) {
    if (width < 768) {
      return mobile = true
    }
    return mobile = false
  }
}
