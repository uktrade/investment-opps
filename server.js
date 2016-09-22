var 	express		= require('express'),
    	app			= express(),
    	port        = process.env.PORT || 3000;


//some basic redirect routes
app.get('/', function(req, res) {
  res.redirect('us/');
});

app.set('case sensitive routing', false);

app.use(express.static(__dirname + '/build'));

app.listen(port, function() {
    console.log('listening');
});
