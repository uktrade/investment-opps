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
  var responsive =  width * 6.5
  var active = d3.select(null)
  var scaleR = d3.scaleLinear().domain([0, 72]).range([0, 15])
  var activeRegion = {
    path: null,
    border: null
  }
  var selectCallback

  var svg = d3.select('#' + container.attr('id'))
    .append('svg')
    .attr('width', width)
    .attr('height', height)

  var projection = d3.geoAlbers()
    .center([0, 55.4])
    .rotate([4.5, 0])
    .scale(responsive)
    .translate([width / 2, height / 2])

  var path = d3.geoPath()
    .projection(projection)
  var g

  draw()

  function draw() {
    debug('D3:', d3)
    debug('Drawing the map,width', width)

    svg.append('rect')
      .attr('class', 'background')
      .attr('width', width)
      .attr('height', height)
      .on('click', reset)

    g = svg.append('g')

    d3.json(_assets + 'map.json', function (err, uk) {
      if (err) {
        error(err)
      }

      g.selectAll('path')
        .data(topojson.feature(uk, uk.objects.collection).features)
        .enter()
        .append('path')
        .attr('class', function (d) {
          return 'region ' + d.id
        })
        .attr('d', path)
        .on('click', clicked)

      // g.append('path')
      //   .datum(topojson.mesh(uk, uk.objects.collection, function (a, b) {
      //     return a !== b
      //   }))
      //   .attr('d', path)
      //   .attr('class', 'region-boundary')
    })
  }

  function onSelect(cb) {
    debug('Registering onSelect callback', cb)
    selectCallback=cb
  }

  function clicked(d) {

    //reset if active zone is clicked
    if (active.node() === this) return reset()

    active.classed('active', false)
    active = d3.select(this).classed('active', true)
    activeRegion.path = d

    var bounds = path.bounds(d)
    var dx = bounds[1][0] - bounds[0][0]
    var dy = bounds[1][1] - bounds[0][1]
    var border = {}
    border.x = (bounds[0][0] + bounds[1][0]) / 2
    border.y = (bounds[0][1] + bounds[1][1]) / 2
    border.scale = .7 / Math.max(dx / width, dy / height)
    activeRegion.border = border
    zoom()

    if(selectCallback) {
      selectCallback(d)
    }

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
    if(filter.businesses || (!filter.businesses && !filter.centres)) {
    svg.selectAll('circle')
      .data(list)
      .enter()
      .append('circle')
      .attr('cx', function (d) {
        return projection(d.geometry.coordinates)[0]
      })
      .attr('cy', function (d) {
        return projection(d.geometry.coordinates)[1]
      })
      .attr('fill', 'rgba(0,255,0,.5)')
      .attr('r', function (d) {
        return scaleR(d.properties.business)
      })
    }

    if(filter.centres || (!filter.businesses && !filter.centres)) {
    svg.selectAll('ellipse')
      .data(list)
      .enter()
      .append('ellipse')
      .attr('cx', function (d) {
        return projection(d.geometry.coordinates)[0]
      })
      .attr('cy', function (d) {
        return projection(d.geometry.coordinates)[1]
      })
      .attr('fill', 'rgba(255,0,0,.5)')
      .attr('rx', function (d) {
        return scaleR(d.properties.centres)
      })
      .attr('ry', function (d) {
        return scaleR(d.properties.centres)
      })
    }

    if (active.node()) return zoom()
  }

  function zoom() {
    var x = activeRegion.border.x
    var y = activeRegion.border.y
    var scale = activeRegion.border.scale
    var translate = [width / 2 - scale * x, height / 2 - scale * y]

    g.transition()
      .duration(750)
      .style('stroke-width', 1.5 / scale + 'px')
      .attr('transform', 'translate(' + translate + ')scale(' + scale + ')')

    if(!points) {
      return
    }

    //scale points
    svg.selectAll('circle')
      .transition()
      .duration(750)
      .attr('transform',
        'translate(' + width / 2 + ',' + height / 2 +
        ')scale(' + scale + ')translate(' + -x + ',' + -y + ')')
      .attr('r', function (d) {
        return scaleR(d.properties.business) / (scale/2)
      })

    svg.selectAll('ellipse')
      .transition()
      .duration(750)
      .attr('transform',
        'translate(' + width / 2 + ',' + height / 2 +
        ')scale(' + scale + ')translate(' + -x + ',' + -y + ')')
      .attr('rx', function (d) {
        return scaleR(d.properties.centres) / (scale/2)
      })
      .attr('ry', function (d) {
        return scaleR(d.properties.centres) / (scale/2)
      })

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


    if(!points) {
      return
    }

    //scale out the points
    svg.selectAll('circle')
      .transition()
      .duration(750)
      .attr('transform', '')
      .attr('r', function (d) {
        return scaleR(d.properties.business)
      })

    svg.selectAll('ellipse')
      .transition()
      .duration(750)
      .attr('transform', '')
      .attr('rx', function (d) {
        return scaleR(d.properties.centres)
      })
      .attr('ry', function (d) {
        return scaleR(d.properties.centres)
      })

    if(selectCallback) {
      selectCallback()
    }
  }

  function removePoints() {
    svg.selectAll('circle').remove()
    svg.selectAll('ellipse').remove()
  }

  function refresh(_points, filter) {
    debug('Refreshing data points', _points)
    var data = []
    _points.map(function (d, i) {
      data.push({
        id: i,
        type: 'Feature',
        properties: {
          name: d.local_authority,
          industry: d.industry,
          business: d.businesses,
          centres: d.centres,
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



  //expose map function
  return {
    refresh: refresh,
    onSelect: onSelect
  }
}



