var fs = require('fs')
var path = '../src/assets/data_points_sector'
var data = JSON.parse(fs.readFileSync(path + '.json', 'utf-8'))

function reduce(data) {

  var array = []
  var industryName

  for (var x = 0; x < data.length; x++) {
    if (entityExists(data[x].name, array) === false) {

      var datum = {}

      industryName = sanitiseName(data[x].industry)

      datum.name = data[x].name
      datum.region = data[x].region
      datum.industry = {}
      datum.industry[industryName] = {
        'business_concentration': concentration(data[x].businesses),
        'centres_concentration': concentration(data[x].centres),
        'zone_available': available(data[x].zones)
      }
      array.push(datum)
    } else {

      industryName = sanitiseName(data[x].industry)

      var industryItem = {
        'business_concentration': concentration(data[x].businesses),
        'centres_concentration': concentration(data[x].centres),
        'zone_available': available(data[x].zones)
      }
      var index = findIndex(data[x].name, array)
      array[index].industry[industryName] = industryItem
    }
  }
  return writeToFile(array)
}


function entityExists(name, array) {
  if (array.length > 0) {
    for (var x = 0; x < array.length; x++) {
      if (array[x].name === name) {
        return true
      }
    }
  }
  return false
}

function findIndex(name, array) {
  for (var x = 0; x < array.length; x++) {
    if (array[x].name === name) {
      return x
    }
  }
  throw err
}

function sanitiseName(name) {
  return name.replace(/ /g, '_').toLowerCase()
}


function available(val) {
  value= val ? val : 0
  if(value> 0) {
    return 'yes'
  } else {
    return 'no'
  }
}

function concentration(val) {
  value = val ? val:  0

  switch (true) {
    case (value ===0):
      return '-'
    case (value > 0 && value<3000):
      return 'low'
    case (value >= 3000 && value<7000):
      return 'medium'
    case (value >= 7000):
      return 'high'
  }
}

function writeToFile(array) {
  var json = JSON.stringify(array)
  fs.writeFile(path + '_reduce.json', json, 'utf8', function(err) {
    if (err) {
      return console.log(err)
    } else {
      console.log('file successfully created')
    }
  })
}

reduce(data)
