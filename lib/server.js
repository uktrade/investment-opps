var express = require('express'),
  fs = require('fs'),
  https = require('https'),
  app = express(),
  port = process.env.PORT || 3000,
  httpsPort=process.env.HTTPS_PORT || 5555

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
