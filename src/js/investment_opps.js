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
  var sectorName = container.find('#sector-name')
  var sectorLink = container.find('#sector-link')
  var sectorSelector = container.find('#sector-selector')
  var regionSelector = container.find('#region-selector')
  var regenerationOpps = container.find('#regeneration-opps')
  var northernPowerhouse = container.find('#northern-powerhouse')
  var midlandsEngine = container.find('#midlands-engine')
  var filters = container.find('.dit-iopps-section__options')
  var details = container.find('#sidebar-details')
  var instructions = container.find('#form-instructions')
  var businessFilter = container.find('#significant-businesses')
  var zonesFilter = container.find('#enterprise-zones')
  var centresFilter = container.find('#innovation-centres')
  var closeRegion = container.find('#close')
  var bodyWidth = $('body').width()
  var mapContainer = container.find('#map-container')



  regenerationOpps.hide()
  northernPowerhouse.hide()
  midlandsEngine.hide()

  initMap()
  loadData().then(filter)
  watch()
  close()
  filters.hide()
  details.hide()

  function initMap() {
    map = require('./map')(container.find('#map'))
    map.onSelect(filterRegion)
    if (bodyWidth < 768) {
      mapContainer.detach().insertAfter('#sidebar')
    }
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
    sectorSelector.change(function() {
      var link = $('option:selected', this).data('link')
      sectorName.html(sectorSelector.val())
      sectorLink.attr('href', link)
      filter()
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

  function changeRegion() {
    debug('Changing region', northernPowerhouse)
    filterRegion(name)
    map.selectRegion(name)
  }

  function filterRegion(name) {
    northernPowerhouse.hide()
    midlandsEngine.hide()
    if (name) {
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
      regenerationOpps.hide()
    }
    debug('region: ', name)
    if (name) {
      region = name
      details.show(500)
    } else {
      details.hide(350)
      region = null
    }
    regionSelector.val(name)
    filter()
  }


  function filter() {
    var industry = sectorSelector.val()
    if (!industry) {
      filteredData = TAFFY([])()
      render()
      return
    }
    var _filter = {
      industry: sectorSelector.val()
    }
    filters.show(750)
    if (region) {
      _filter.region = region
    }
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
    if (!region) {
      return
    }
    var clusters = filteredData.order('businesses desc').limit(3).get()
    debug('Notable clusters are:', clusters)
    $.each(clusters, function(index, cluster) {
      clustersList.append($('<li>').html(cluster.name))
    })
  }

  function fetch(url) {
    debug('Fetching data', url)
    return $.getJSON(_assets + url)
      .fail(fail)
  }

  function fail(err) {
    error('Error:', err)
  }
}
