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
  var sectorSelector = container.find('#sector-selector')
  var regionSelector = container.find('#region-selector')
  var businessFilter = container.find('#significant-businesses')
  var zonesFilter = container.find('#enterprise-zones')
  var centresFilter = container.find('#innovation-centres')

  initMap()
  loadData().then(filter)
  watch()

  function initMap() {
    map = require('./map')(container.find('#map'))
    map.onSelect(filterRegion)
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
    sectorSelector.change(filter)
    regionSelector.change(changeRegion)
    businessFilter.change(filterChanged)
    centresFilter.change(filterChanged)
    zonesFilter.change(filterChanged)
  }

  function changeRegion() {
    var name = $(this).val()
    filterRegion(name)
    map.selectRegion(name)
  }

  function filterRegion(name) {
    debug('region: ', name)
    if (name) {
      region = name
    } else {
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
