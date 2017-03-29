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
  var chooseInd = container.find('#choose-industry')
  var filters = container.find('.dit-iopps-section__options')
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
  initMap()
  loadData().then(filter)
  watch()
  close()
  goToMap()
  filters.hide()
  details.hide()

  function initMap() {
    map = require('./map')(container.find('#map'))
    map.onSelect(filterRegion)
    if (mobile) {
      mapContainer.detach().insertAfter('#sidebar')
    }
  }

  function loadData() {
    var file = 'data_points_sector.json'
    return fetch(file)
      .then(function (list) {
        data = TAFFY(list)
        return list
      })
  }

  function watch() {
    sectorSelector.change({sector: true}, filter)
    regionSelector.change(changeRegion)
    businessFilter.change(filterChanged)
    centresFilter.change(filterChanged)
    zonesFilter.change(filterChanged)
  }

  function close() {
    closeRegion.click(function () {
      $('html, body').animate({
        scrollTop: $('#map').offset().top
      }, 500)
      filterRegion()
      map.selectRegion()
    })

  }

  function goToMap() {
    goBtn.click(function () {
      $('html, body').animate({
        scrollTop: $("#map").offset().top
      }, 750)
    })
  }

  function changeRegion() {
    var name = $(this).val()
    console.log(name)
    filterRegion(name)
    map.selectRegion(name)
  }

  function filterRegion(name) {
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
    }
    regionSelector.val(name)
    filter({data:{sector:false}})
  }


  function filter(event) {
    var industry = sectorSelector.val()
    var sector = event.data.sector
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
        scrollTop: $("#filters").offset().top
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
    if (!region) {
      return
    }
    var clusters = filteredData.order('businesses desc').limit(3).get()
    debug('Notable clusters are:', clusters)
    $.each(clusters, function (index, cluster) {
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
