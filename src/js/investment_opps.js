module.exports={init: init}

require('bootstrap-table')
var logger=require('./logger')('investment opps')
var debug=logger.debug
var error=logger.error
var _assets=document.iigbBuild ? '/assets/' + document.iigbBuild + '/':'/assets/'
var TAFFY=require('taffydb').taffy
var table
var data
var filter={}
var filteredData
var currentTab='tab-map'
var map

function init() {
  var oppsContainer=$('#investment-opps-container')
  if(oppsContainer.length === 0) {
    return
  }
  debug('Found investment opps container, initialising')
  fetch('iopps.json')
    .done(function(list) {
      map = require('./map')(oppsContainer.find('#map'))
      map.onSelect(filterRegion)
      data=TAFFY(list)
      table=$('#opps-table')
      table.bootstrapTable({data: []})
      watch()
    })
    .fail(fail)
}
function watch() {
  initTabs()
  watchIndustryFilter()
  watchBusinessesFilter()
  watchCentresFilter()
}

function watchIndustryFilter() {
  $('.industry-selector')
    .change(function() {
      var selected=$(this).val()
      if(selected === filter.industry) {
        return
      }
      filter.industry=selected
      debug('Selected industry', selected)
      filterData()
    })
}

function watchBusinessesFilter() {
  $('#significant-businesses')
    .change(function() {
      var checked= $(this).is(':checked')
      filter.businesses= checked
      filterData()
    })
}

function watchCentresFilter() {
  $('#innovation-centres')
    .change(function() {
      var checked= $(this).is(':checked')
      filter.centres= checked
      filterData()
    })
}

function initTabs() {
  var controls=$('[data-tab-control]')
  var tabs=[]
  controls.each(function() {
    tabs.push($('#'+ $(this).data('tab-control')))
  })

  controls
    .click(function() {
      var goto=$(this).data('tab-control')
      if(currentTab===goto) {
        return
      }
      debug('Changing tab to ', goto)
      changeTab(goto)
      render()
    })


  function changeTab(goto) {
    currentTab=goto
    controls.each(function(index) {
      var control=$(this)
      var tab=tabs[index]
      if(control.data('tab-control')===goto)  {
        control.addClass('active')
        tab.addClass('in active')
      }else {
        control.removeClass('active')
        tab.removeClass('in active')
      }

    })
  }
}

function filterRegion(d) {
  debug('region: ',d)
  if(d) {
    filter.region=d.properties.name
  } else {
    delete filter.region
  }
  filterData()
}

function filterData() {
  debug('Filtering data by', filter)
  var _filter= {}
  if(filter.industry) {
    _filter.industry=filter.industry
  }
  if(filter.region) {
    _filter.region=filter.region
  }
  if(filter.businesses) {
    _filter.businesses = {gt: 0}
  }
  if(filter.centres) {
    _filter.centres = {gt: 0}
  }
  filteredData=data(_filter).get()
  render()
}

function render() {
  if(currentTab === 'tab-table') {
    refreshTable(filteredData)
  } else if (currentTab==='tab-map') {
    map.refresh(filteredData,filter)
  }
}

function refreshTable(list) {
  debug('Table', list)
  table.bootstrapTable('load', list)
}

function fetch(url) {
  debug('Fetching data' , url)
  return $.getJSON(_assets + url )
}

function fail(err) {
  error('Failed reading businesses data', err)
}
