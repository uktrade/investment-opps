var d3 = require('d3')
var topojson = require('topojson')
var logger = require('./logger')('Map')
var error = logger.error
var debug = logger.debug
var _assets = document.iigbBuild ? '/assets/' + document.iigbBuild + '/' : '/assets/'



module.exports = init

function init(container) {
  debug('Initialising map in: ', container)
  return Map(container)
}


function Map(container) {
  var points
  var width = container.width()
  var height = width * 1.21
  var responsive = width * 6.5
  var regions = []
  var BUSINESSES = 'businesses'
  var CENTRES = 'centres'
  var ZONES = 'zones'

  var svg // main svg element
  var g //map
  var path //geo path
  var projection
  var active = d3.select(null)
  var scaleR = d3.scaleLinear().domain([0, 10000]).range([0, 20])
  var activeRegion
  var selectCallback

  init()

  function init() {
    debug('Drawing the map,width', width)

    //create svg element
    svg = d3.select('#' + container.attr('id'))
      .append('svg')
      .attr('width', width)
      .attr('height', height)

    projection = d3.geoAlbers()
      .center([0, 55.4])
      .rotate([4.5, 0])
      .scale(responsive)
      .translate([width / 2, height / 2])

    path = d3.geoPath()
      .projection(projection)

    drawBackground(svg)
    drawMap(svg)
    callOutListener()
  }

  function drawBackground(svg) {
    svg.append('rect')
      .attr('class', 'background')
      .attr('width', width)
      .attr('height', height)
      .on('click', reset)
  }

  function drawMap(svg) {
    g = svg.append('g')
    d3.json(_assets + 'map.json', function(err, uk) {
      if (err) {
        error(err)
      }

      g.selectAll('path')
        .data(topojson.feature(uk, uk.objects.collection).features)
        .enter()
        .append('path')
        .attr('class', function(d) {
          var region = {
            d: d,
            path: this
          }
          regions.push(region)
          return 'region ' + d.id
        })
        .attr('d', path)
        .on('click', toggleRegion)
    })
  }

  function onSelect(cb) {
    selectCallback = cb
  }


  function drawPoints(filter) {
    removePoints()

    var list
    if (points) {
      list = points
    } else {
      list = []
    }

    debug('Drawing data points')
    var canvas = svg.selectAll('circle').data(list)

    if (filter.businesses) {
      appendCircle(canvas, BUSINESSES)
    }
    if (filter.centres) {
      appendCircle(canvas, CENTRES)
    }

    if (filter.zones) {
      appendCircle(canvas, ZONES)
    }

    if (active.node()) return zoomAllPoints()
  }

  function appendCircle(canvas, property) {
    canvas.enter()
      .append('circle')
      .attr('cx', function(d) {
        return projection(d.geometry.coordinates)[0]
      })
      .attr('cy', function(d) {
        return projection(d.geometry.coordinates)[1]
      })
      .attr('class', 'point ' + property)
      .attr('r', function(d) {
        return scaleR(d.properties[property])
      })
  }

  function toggleRegion(d) {

    //zoom out if active zone is clicked
    if (active.node() === this) return reset()

    var region = {
      d: d,
      path: this
    }
    zoom(region)
    if (selectCallback) {
      selectCallback(d.properties.name)
    }

  }

  function selectRegion(name) {
    if(!name) {
      return reset()
    }
    $.each(regions, function(index, r) {
      if (name === r.d.properties.name) {
        debug('Found region')
        zoom(r)
        return false //break loop
      }
    })
  }

  function zoom(region) {
    zoomRegion(region)
    zoomAllPoints()
  }

  function zoomAllPoints() {

    if (!points) {
      return
    }
    //scale points
    zoomPoints(BUSINESSES)
    zoomPoints(CENTRES)
    zoomPoints(ZONES)
  }

  function zoomRegion(region) {
    var d = region.d
    active.classed('active', false)
    active = d3.select(region.path).classed('active', true)

    var bounds = path.bounds(d)
    var dx = bounds[1][0] - bounds[0][0]
    var dy = bounds[1][1] - bounds[0][1]
    var border = {}
    border.x = (bounds[0][0] + bounds[1][0]) / 2
    border.y = (bounds[0][1] + bounds[1][1]) / 2
    border.scale = .7 / Math.max(dx / width, dy / height)

    var x = border.x
    var y = border.y
    var scale = border.scale
    var translate = [width / 2 - scale * x, height / 2 - scale * y]

    g.transition()
      .duration(750)
      .style('stroke-width', 1.5 / scale + 'px')
      .attr('transform', 'translate(' + translate + ')scale(' + scale + ')')

    activeRegion = region
    activeRegion.border = border
  }

  function zoomPoints(property) {
    debug('Zoom points:', property)
    var x = activeRegion.border.x
    var y = activeRegion.border.y
    var scale = activeRegion.border.scale

    svg.selectAll('.' + property)
      .transition()
      .duration(750)
      .attr('transform',
        'translate(' + width / 2 + ',' + height / 2 +
        ')scale(' + scale + ')translate(' + -x + ',' + -y + ')')
      .attr('r', function(d) {
        return scaleR(d.properties[property]) / (scale / 2)
      })
    showCallOut()

  }

  function reset() {
    active.classed('active', false)
    active = d3.select(null)
    activeRegion = {
      path: null,
      border: null
    }

    g.transition()
      .duration(750)
      .style('stroke-width', '1px')
      .attr('transform', '')

    debug('Resetting points: ', points)


    if (!points) {
      return
    }

    resetPoints(BUSINESSES)
    resetPoints(CENTRES)
    resetPoints(ZONES)

    if (selectCallback) {
      window.setTimeout(function() {
        selectCallback()
      }, 700)
    }
    hideCallOut()
  }

  function resetPoints(property) {
    //scale out the points
    svg.selectAll('.' + property)
      .transition()
      .duration(750)
      .attr('transform', '')
      .attr('r', function(d) {
        return scaleR(d.properties[property])
      })
  }

  function removePoints() {
    svg.selectAll('circle').remove()
  }

  function refresh(_points, filter) {
    debug('Refreshing data points', _points)
    var data = []
    _points.map(function(d, i) {
      data.push({
        id: i,
        type: 'Feature',
        properties: {
          name: d.local_authority,
          industry: d.industry,
          businesses: d.businesses,
          centres: d.centres,
          zones: d.zones,
          region: d.region
        },
        geometry: {
          coordinates: [+d.long, +d.lat],
          type: 'Point'
        }
      })
    })
    points = data
    drawPoints(filter)
  }

  d3.select(window)
    .on('resize', sizeChange)

  function sizeChange() {
    var scale = $('.map-view').width() / 1050

    d3.select('g')
      .attr('transform', 'scale(' + scale + ')')
    $('svg').height($('.container-fluid').width() * 1.45)

    // insert debouncing plot function here
    svg.selectAll('circle')
      // .transition()
      // .duration(750)
      .attr('transform',
        'scale(' + scale + ')')
      .attr('r', function(d) {
        return scaleR(d.properties.businesses)
      })

    svg.selectAll('ellipse')
      // .transition()
      // .duration(750)
      .attr('transform',
        'scale(' + scale + ')')
      .attr('rx', function(d) {
        return scaleR(d.properties.centres)
      })
      .attr('ry', function(d) {
        return scaleR(d.properties.centres)
      })
  }

  function callOutListener() {
    $('.map-tab').click(function() {
      hideCallOut()
    })
    $('.table-tab').click(function() {
      setTimeout(function() {
        callOutSwitcher()
      }, 300)
    })
    $('#sector-selector').change(function() {
      setTimeout(function() {
        callOutSwitcher()
      }, 50)
    })
  }

  function callOutSwitcher() {
    if ($('#table-view').height() > 500) {
      hideCallOut()
      showInlineCallOut()
    } else {
      showCallOut()
    }
  }

  function showCallOut() {
    $('.dit-iopps-sidebar__call-out').fadeIn("slow")
  }

  function showInlineCallOut() {
    $('.dit-iopps-sidebar__call-out-inline').fadeIn("slow")
  }

  function hideCallOut() {
    $('.dit-iopps-sidebar__call-out').fadeOut("slow")
    $('.dit-iopps-sidebar__call-out-inline').fadeOut("slow")
  }



  //expose map function
  return {
    refresh: refresh,
    onSelect: onSelect,
    selectRegion: selectRegion
  }
}
