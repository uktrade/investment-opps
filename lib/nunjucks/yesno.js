module.exports = function(data) {
  if (!data || data === '' || data==='No') {
    return 'no'
  } else {
    return 'yes'
  }
}
