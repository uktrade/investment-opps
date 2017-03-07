module.exports={init: init}

require('bootstrap-table')
var logger=require('./logger')('investment opps')
var debug=logger.debug
var error=logger.error
var _assets=document.iigbBuild ? '/assets/' + document.iigbBuild + '/':'/assets/'
var TAFFY=require('taffydb').taffy
var table
var data
var filter
var industry

function init() {
  fetch('iopps.json')
    .done(function(list) {
      data=TAFFY(list)
      table=$('#opps-table')
      table.bootstrapTable({data: []})
      watch()
    })
    .fail(fail)
}

function watch() {
  $('.industry-selector')
    .change(function() {
      var selected=$(this).val()
      if(selected === industry) {
        return
      }
      industry=selected
      filter=data({industry: selected})
      debug('Selected industry', selected)
      refreshTable(filter.get())
    })
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
