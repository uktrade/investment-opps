fs = require('fs');
path = '../src/assets/data_points_sector'
data = JSON.parse(fs.readFileSync(path + '.json', "utf-8"))

function reduce(data) {

  var array = []
  var industryName

  for (x = 0; x < data.length; x++) {
    if (entityExists(data[x].name, array) == false) {

      var datum = {}

      industryName = sanitiseName(data[x].industry)

      datum.name = data[x].name;
      datum.region = data[x].region;
      datum.industry = {}
      datum.industry[industryName] = {
        "business_concentration": data[x].business_concentration,
        "centres_concentration": data[x].centres_concentration,
        "zone_available": data[x].zone_available
      }
      array.push(datum)
    } else {

      industryName = sanitiseName(data[x].industry)

      var industryItem = {
        "business_concentration": data[x].business_concentration,
        "centres_concentration": data[x].centres_concentration,
        "zone_available": data[x].zone_available
      }
      var index = findIndex(data[x].name, array)
      array[index].industry[industryName] = industryItem
    }
  }
  return writeToFile(array);
}


function entityExists(name, array) {
  if (array.length > 0) {
    for (var x = 0; x < array.length; x++) {
      if (array[x].name == name) {
        return true;
      }
    }
  }
  return false;
}

function findIndex(name, array) {
  for (var x = 0; x < array.length; x++) {
    if (array[x].name == name) {
      return x;
    }
  }
  throw err;
}

function sanitiseName(name) {
  return name.replace(/ /g, '_').toLowerCase();
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

reduce(data);
