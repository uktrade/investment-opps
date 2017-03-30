var d3 = require('d3')
var topojson = require('topojson')
var logger = require('./logger')('Map')
var error = logger.error
var debug = logger.debug
var _assets = document.iigbBuild ? '/assets/' + document.iigbBuild + '/' : '/assets/'
var ratio = 1.21
var scale = 3.5


module.exports = init

function init(container) {
  debug('Initialising map in: ', container)
  return Map(container)
}


function Map(container) {
  var points
  var BUSINESSES = 'businesses'
  var CENTRES = 'centres'
  var ZONES = 'zones'

  var svg
  var tooltip
  var width
  var height
  var map
  var active = d3.select(null)
  var scaleZoomout = d3.scaleLinear().domain([0, 11]).range([0, 11])
  var scaleZoomin = d3.scaleLinear().domain([0, 10]).range([0, 4])
  var selectCallback

  init()

  function init() {
    width = container.width()
    height = width * ratio
    debug('Drawing the map,width', width)
    svg = createSvg()
    drawMap(svg)
      .then(function(_map) {
        map = _map
      })
      .fail(function(err) {
        error('Failed drawing map:', err)
      })

  }

  function createSvg() {
    var c = d3.select('#' + container.attr('id'))
    tooltip = c.append('div').attr('class', 'tooltip hidden')

    var zoom = d3.zoom()
      .scaleExtent([1, 1])
      .on('zoom', move)

    /* Using following stackoverflow answer to make svg responsive
     * http://stackoverflow.com/questions/16265123/resize-svg-when-window-is-resized-in-d3-js#25978286
     */
    return c
      .append('div')
      .attr('class', 'svg-container') //container class to make it responsive
      .on('click', reset)
      // .call(zoom)
      .append('svg')
      //responsive SVG needs these 2 attributes and no width and height attr
      .attr('preserveAspectRation', 'xMinYMin meet')
      .attr('viewBox', '0 0 ' + width + ' ' + height)
      //class to make it responsive
      .attr('class', 'svg-content-responsive background')



    function move() {

      var t = [d3.event.transform.x, d3.event.transform.y]
      var s = d3.event.transform.k
      var h = height / 4

      t[0] = Math.min(
        (width / height) * (s - 1),
        Math.max(width * (1 - s), t[0])
      )

      t[1] = Math.min(
        h * (s - 1) + h * s,
        Math.max(height * (1 - s) - h * s, t[1])
      )

      //zoom.translateBy(t)
      map.g.attr('transform', 'translate(' + t + ')scale(' + s + ')')

      //adjust the country hover stroke width based on zoom level
      map.g.selectAll('g').style('stroke-width', 1.5 / s)
    }


  }

  function drawMap(svg) {
    var map = {}
    map.g = svg.append('g')
    return $.getJSON(_assets + 'regions-topo.json')
      .then(function(uk) {
        map.projection = d3.geoMercator()
          .center([0, 55.4])
          .rotate([6.5, 0])
          .scale(width * scale * 0.95)
          .translate([width / 2, height / 2])

        map.path = d3.geoPath()
          .projection(map.projection)

        map.g.selectAll('g')
          .data(topojson.feature(uk, uk.objects.regions).features)
          .enter()
          .append('g')
          .attr('class', function(d) {
            return 'region ' + d.id
          })
          .attr('id', function(d) {
            return d.id
          })
          .attr('name', function(d) {
            return d.properties.name.replace(/ /g, '')
          })
          .on('click', toggleRegion)
          .append('path')
          .attr('d', map.path)
        return map
      })
  }

  function onSelect(cb) {
    selectCallback = cb
  }


  function refreshCircles(filter) {
    var list = points ? points : []

    //group points by region
    var pointsByRegion = d3
      .nest().key(function(d) {
        return d.properties.region
      })
      .object(list)

    debug('Data by region', pointsByRegion)

    var groups = map.g.selectAll('g')
      .selectAll('g')
      .data(function(d) {
        var region = pointsByRegion[d.properties.name]
        return region ? region : []
      }, function(d) {
        return d.id //unique id for point is authority name
      })

    removeGroups(groups.exit())
    var g = groups.enter().append('g')
    drawCircles(BUSINESSES)
    drawCircles(CENTRES)
    drawCircles(ZONES)
    // if (active.node()) return zoomAllPoints()

    function drawCircles(property) {
      updateCircles()
      appendCircles()

      function updateCircles() {
        var allPoints = groups.select('.' + property)
        debug('Updaing circles', property, allPoints)
        allPoints.transition().attr('r', getDiameter)
      }

      function appendCircles() {
        //append new circles inserted with new data
        g.append('circle')
          .attr('class', 'point ' + property)
          .attr('cx', function(d) {
            return map.projection(d.geometry.coordinates)[0]
          })
          .attr('cy', function(d) {
            return map.projection(d.geometry.coordinates)[1]
          })
          .on('mouseenter', showTooltip)
          .on('mouseleave', removeTooltip)
          .on('click', removeTooltip)
          .transition()
          .attr('r', getDiameter)
      }

      function getDiameter(d) {
        if (filter[property]) {
          var r
          if (active.node() == null) {
            r = scaleZoomout(round(d.properties[property]))
          } else {
            if (d.properties.region === 'Scotland') {
              r = scaleZoomout(round(d.properties[property]))
            } else {
              r = scaleZoomin(round(d.properties[property]))
            }
          }
          return r
        } else {
          return 0
        }
      }

      // scale value between 0 and 10 and round to an integer
      function round(value) {
        if (value) {
          return Math.ceil(value / 1000) + 1
        } else {
          return 0
        }

      }
    }

    function removeGroups(groups) {
      debug('Removing groups', groups)
      groups.transition()
        .remove()
    }
  }

  function toggleRegion(d) {
    d3.event.stopPropagation() // do trigger click even on background
    if (active.node() === this) return reset()
    var region = d3.select(this)
    zoom(region)
    if (selectCallback) {
      selectCallback(d.properties.name)
    }

  }

  function zoom(region) {
    active.classed('active', false)
    active = region.classed('active', true)
    var bounds = map.path.bounds(region.datum())
    var dx = bounds[1][0] - bounds[0][0]
    var dy = bounds[1][1] - bounds[0][1]
    var border = {}
    border.x = (bounds[0][0] + bounds[1][0]) / 2
    border.y = (bounds[0][1] + bounds[1][1]) / 2
    border.scale = .9 / Math.max(dx / width, dy / height)

    var x = border.x
    var y = border.y
    var scale = border.scale
    var translate = [width / 2 - scale * (x * .982), height / 2 - scale * y]
    map.g.transition()
      .duration(750)
      .style('stroke-width', 4.5 / scale + 'px')
      .attr('transform', 'translate(' + translate + ')scale(' + scale + ')')
  }

  function selectRegion(name) {
    if (!name) {
      return reset()
    }
    zoom(svg.select('g[name=' + name.replace(/ /g, '') + ']'))
  }

  function reset() {
    active.classed('active', false)
    active = d3.select(null)
    map.g.transition()
      .duration(750)
      .style('stroke-width', '1px')
      .attr('transform', '')

    if (selectCallback) {
      window.setTimeout(function() {
        selectCallback()
      }, 50)
    }
  }

  function refresh(_points, filter) {
    debug('Refreshing data points', _points)
    var data = []
    _points.map(function(d) {
      data.push({
        id: d.name,
        type: 'Feature',
        properties: {
          industry: d.industry,
          businesses: d.businesses,
          centres: d.centres,
          zones: d.zones,
          region: d.region
        },
        geometry: {
          coordinates: [d.long, d.lat],
          type: 'Point'
        }
      })
    })
    points = data
    refreshCircles(filter)
  }

  function refreshFilter(filter) {
    refreshCircles(filter)
  }

  function showTooltip() {
    var mouse = d3.mouse(svg.node()).map(function(d) {
      return parseInt(d)
    })

    var position = 'left:' + (mouse[0] + 20) + 'px;top:' + (mouse[1]) + 'px'
    debug('Mouse', mouse)
    tooltip.classed('hidden', false)
      .attr('style', position)
      .html(this.__data__.id)
  }

  function removeTooltip() {
    tooltip.classed('hidden', true)
  }

  //expose map function
  return {
    refresh: refresh,
    refreshFilter: refreshFilter,
    onSelect: onSelect,
    selectRegion: selectRegion
  }
}
