module.exports = {
  init: init
}

require('bootstrap-table')
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
  var map
  var data //main data
  var region // active region
  var filteredData

  //elements
  var clustersList = container.find('#notable-clusters')
  var clusters = container.find('#clusters')
  var sectorLink = container.find('#sector-link')
  var sectorSelector = container.find('#sector-selector')
  var regionSelector = container.find('#region-selector')
  var chooseInd = container.find('#choose-industry')
  var regenerationOpps = container.find('#regeneration-opps')
  var northernPowerhouse = container.find('#northern-powerhouse')
  var midlandsEngine = container.find('#midlands-engine')
  var filters = container.find('#filters')
  var details = container.find('#sidebar-details')
  var instructions = container.find('#form-instructions')
  var businessFilter = container.find('#significant-businesses')
  var zonesFilter = container.find('#enterprise-zones')
  var centresFilter = container.find('#innovation-centres')
  var closeRegion = container.find('#close')
  var goBtn = container.find('#go-btn')
  var bodyWidth = $('body').width()
  var bodyHeight = $('body').height()
  var mapContainer = container.find('#map-container')
  var mobile

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
        data = TAFFY(list)
        return list
      })
  }

  function watch() {
    sectorSelector
      .change({
        sector: true
      }, function(event) {
        var industry = sectorSelector.val()
        if (industry && industry !== '') {
          var selected = $('option:selected', this)
          sectorLink.attr('href', selected.data('link'))
          sectorLink.show()
        } else {
          sectorLink.hide()
        }
        filter(event)
      })
    regionSelector.change(changeRegion)
    businessFilter.change(filterChanged)
    centresFilter.change(filterChanged)
    zonesFilter.change(filterChanged)
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

  function changeRegion() {
    var name = regionSelector.val()
    filterRegion(name)
    map.selectRegion(name)
  }

  function filterRegion(name) {
    northernPowerhouse.hide()
    midlandsEngine.hide()
    if (name) {
      window.location.hash = 'region-' + name
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
      window.location.hash = ''
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
    filteredData = data(_filter)
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
      chooseInd.css('min-height', bodyHeight - 20 + 'px')
      filters.css('min-height', bodyHeight - 20 + 'px')
      $('#map').css('min-height', bodyHeight - 20 + 'px')
      return mobile = true
    }
    return mobile = false
  }
}
