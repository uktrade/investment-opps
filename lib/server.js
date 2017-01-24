var express = require('express'),
  app = express(),
  port = process.env.PORT || 3000;

app.set('case sensitive routing', false);

app.use(express.static(process.cwd() + '/build'));

app.use(function(req, res) {
  res.status(404).sendFile(process.cwd() + '/build/us/404.html');
})

app.listen(port, function() {
  console.log('listening');
});
