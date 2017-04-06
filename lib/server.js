var express = require('express'),
  fs = require('fs'),
  https = require('https'),
  app = express(),
  auth = require('http-auth'),
  port = process.env.PORT || 3000,
  httpsPort=process.env.HTTPS_PORT || 5555,
  oppsPasswordHash=process.env.OPPS_PASSWORD,
  hash=require('./hash')

/* Redirect http to https */
app.get('*', function(req,res,next) {
  if(req.headers['x-forwarded-proto'] != 'https' && process.env.NODE_ENV === 'production')
    res.redirect('https://'+req.hostname+req.url)
  else
    next() /* Continue to other routes if we're not redirecting */
})

// environment variable OPPS_USERNAME enables http auth
if(oppsPasswordHash) {
  //Basic http authentication
  var basic=auth.basic({
    realm: 'Users'
  },function (username,password, callback) {
    callback(authorise(username,password))
  })
  app.use(auth.connect(basic))
}


app.set('case sensitive routing', false)

app.use(express.static(process.cwd() + '/build'))

app.use(function(req, res) {
  res.status(404).sendFile(process.cwd() + '/build/us/404.html')
})

https.createServer({
  key: fs.readFileSync('dev-ssl/dev.invest.great.gov.uk.key'),
  cert: fs.readFileSync('dev-ssl/dev.invest.great.gov.uk.cer')
}, app).listen(httpsPort)


app.listen(port, function() {
  /* eslint-disable  no-console */
  console.log('listening')
  /* eslint-enable  no-console */
})


function authorise(username,password) {
  var digest=hash.hash(username,password)
  return digest === oppsPasswordHash
}
