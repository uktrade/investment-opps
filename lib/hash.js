var crypto=require('crypto')
module.exports={hash: generateHash}


// Generate a password hash for a username to user with basic http auth
// set OPPS_USERNAME to username of choice  to enable http basic auth
// and set OPPS_PASSWORD to result of this function.
function generateHash(username, password) {
  var hash=crypto.createHmac('sha512', username)
  hash.update(password)
  var value= hash.digest('hex')
  return value
}
