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
  var table
  var data //main data
  var region // active region
  var filteredData
  var currentTab = 'tab-map' //options: tab-map, tab-table

  //elements
  var sectorSelector = container.find('#sector-selector')
  var regionSelector = container.find('#region-selector')
  var businessFilter = container.find('#significant-businesses')
  var zonesFilter = container.find('#enterprise-zones')
  var centresFilter = container.find('#innovation-centres')

  initMap()
  initTable()
  initTabs()
  loadData().then(filter)
  watch()

  function initMap() {
    map = require('./map')(container.find('#map'))
    map.onSelect(filterRegion)
  }

  function initTable() {
    table = $('#opps-table')
    table.bootstrapTable({
      data: []
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
    sectorSelector.change(filter)
    businessFilter.change(filter)
    centresFilter.change(filter)
    zonesFilter.change(filter)
    regionSelector.change(changeRegion)
  }

  function initTabs() {
    var controls = $('[data-tab-control]')
    var tabs = []
    controls.each(function() {
      tabs.push($('#' + $(this).data('tab-control')))
    })

    controls
      .click(function() {
        var goto = $(this).data('tab-control')
        if (currentTab === goto) {
          return
        }
        debug('Changing tab to ', goto)
        changeTab(goto)
        render()
      })


    function changeTab(goto) {
      currentTab = goto
      controls.each(function(index) {
        var control = $(this)
        var tab = tabs[index]
        if (control.data('tab-control') === goto) {
          control.addClass('active')
          tab.addClass('in active')
        } else {
          control.removeClass('active')
          tab.removeClass('in active')
        }

      })
    }
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
      filteredData = []
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
    filteredData = data(_filter).get()
    render()
  }

  function render() {
    var points = {
      businesses: businessFilter.is(':checked'),
      centres: centresFilter.is(':checked'),
      zones: zonesFilter.is(':checked'),
    }
    if (currentTab === 'tab-table') {
      debug('Table', filteredData)
      renderColumns(points)
      table.bootstrapTable('load', filteredData)
    } else if (currentTab === 'tab-map') {
      map.refresh(filteredData, points)
    }
  }


  function renderColumns(points) {
    if (points.businesses) {
      showColumn('business_concentration')
    } else {
      hideColumn('business_concentration')
    }

    if (points.centres) {
      showColumn('centres_concentration')
    } else {
      hideColumn('centres_concentration')
    }

    if (points.zones) {
      showColumn('zone_available')
    } else {
      hideColumn('zone_available')
    }
  }

  function showColumn(field) {
    debug('Showing column', field)
    table.bootstrapTable('showColumn', field)
  }

  function hideColumn(field) {
    debug('Hiding column', field)
    table.bootstrapTable('hideColumn', field)
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
