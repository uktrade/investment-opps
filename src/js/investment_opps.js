module.exports={init: init}

require('bootstrap-table')
var logger=require('./logger')('investment opps')
var debug=logger.debug
var error=logger.error
var _assets=document.iigbBuild ? '/assets/' + document.iigbBuild + '/':'/assets/'
var TAFFY=require('taffydb').taffy

function init() {
  var container=$('#investment-opps-container')
  if(container.length === 0) {
    return
  }
  debug('Found investment opps container, initialising')
  InvestmentOpps(container)
}

function InvestmentOpps(container) {
  var map
  var table
  var industries //list of iigb industries with hierarchy
  var data //main data
  var region // active region
  var filteredData
  var currentTab='tab-map' //options: tab-map, tab-table

  //elements
  var subsectorBlock=container.find('#subsectors')
  var repeat = container.find('#repeat')
  var dataSelector=container.find('#data-selector')
  var sectorSelector=container.find('#sector-selector')
  var subsectorSelector=container.find('#subsector-selector')
  var businessFilter=container.find('#significant-businesses')
  var zonesFilter=container.find('#enterprise-zones')
  var centresFilter=container.find('#innovation-centres')


  subsectorBlock.hide()
  initMap()
  initTable()
  initTabs()
  fetchIndustries()
    .then(loadData)
    .then(filter)
  watch()

  function initMap() {
    map = require('./map')(container.find('#map'))
    map.onSelect(filterRegion)
  }

  function initTable() {
    table=$('#opps-table')
    table.bootstrapTable({data: []})
  }


  function loadData() {
    var file=dataSelector.val()
    if(repeat.is(':checked')) {
      file += '_repeat'
    } else {
      file += '_nonrepeat'
    }
    file+='.json'
    return fetch(file)
      .then(function(list) {
        data=TAFFY(list)
        return list
      })
  }

  function fetchIndustries() {
    return fetch('industries.json')
      .then(function(list) {
        industries=TAFFY(list)
        populateSectors()
        return list
      })
  }

  function populateSectors() {
    var sectors = industries({parent: ''}).get()
    populateOptions(sectorSelector, sectors)
    populateSubsectors()
  }

  function populateSubsectors() {
    var isRepeat = repeat.is(':checked')
    var _filter={parent: sectorSelector.val()}
    var otherOption = opt('Other')
    if(!isRepeat) {
      _filter.priority = 'YES'
    }
    debug('Filtering subsectors by', _filter)
    var subsectors = industries(_filter).get()
    populateOptions(subsectorSelector, subsectors)
    subsectorSelector.append(otherOption)
    if(subsectors.length === 0) {
      otherOption.prop('selected', true)
      subsectorBlock.hide()
    } else {
      subsectorBlock.show()
    }
  }


  function populateOptions(selector, options) {
    selector.empty()
    debug('Populating options for', selector.attr('id'),'using options:', options)
    $.each(options, function(index, option) {
      debug('Option:', option.industry)
      var o= opt(option.industry)
      selector.append(o)
      if(index === 0) {
        o.prop('selected', true)
      }
    })

  }

  function opt(val) {
    return $('<option></option>') .attr('value',val) .text(val)
  }

  function watch() {
    repeat.change(function(){
      populateSubsectors()
      loadData().done(filter)
    })
    sectorSelector.change(function(){
      populateSubsectors()
      filter()
    })
    dataSelector.change(function(){
      loadData().done(filter)
    })
    subsectorSelector.change(filter)
    businessFilter.change(filter)
    centresFilter.change(filter)
    zonesFilter.change(filter)
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
      region=d.properties.name
    } else {
      region=null
    }
    filter()
  }

  function filter() {
    var _filter={
      parent:sectorSelector.val(),
      industry: subsectorSelector.val()
    }
    if(businessFilter.is(':checked')) {
      _filter.businesses = {gt:0}
    }
    if(centresFilter.is(':checked')) {
      _filter.centres = {gt:0}
    }
    if(zonesFilter.is(':checked')) {
      _filter.zones = {gt:0}
    }
    if(region) {
      _filter.region=region
    }
    debug('Filtering data by', _filter)
    filteredData=data(_filter).get()
    render()
  }

  function render() {
    if(currentTab === 'tab-table') {
      debug('Table', filteredData)
      table.bootstrapTable('load', filteredData)
    } else if (currentTab==='tab-map') {
      map.refresh(filteredData,{
        centres: centresFilter.is(':checked'),
        businesses: businessFilter.is(':checked')
      })
    }
  }

  function fetch(url) {
    debug('Fetching data' , url)
    return $.getJSON(_assets + url )
      .fail(fail)
  }

  function fail(err) {
    error('Error:', err)
  }
}
