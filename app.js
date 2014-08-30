var express = require('express'),
	http = require('http'),
	port = process.env.PORT || 3000,
	path = require('path'),
	app = express(),
	config = require("./config/config.js")(),
	mongoose = require('mongoose'),
	Admin = require('./controllers/Admin'),
	Blog = require('./controllers/Blog');

app.set('views', __dirname + '/templates');
app.set('view engine', 'hjs');
app.use(express.favicon());
app.use(express.logger('dev'));
app.use(express.bodyParser());
app.use(express.methodOverride());
app.use(express.cookieParser('notes'));
app.use(express.session());
app.use(app.router);
app.use(require('less-middleware')({ src: __dirname + '/public' }));
app.use(express.static(path.join(__dirname, 'public')));

if ('development' == app.get('env')) {
  	app.use(express.errorHandler());
}

mongoose.connect(config.db.uri);
var db = mongoose.connection, state;
db.on('error', function (err) {
    console.log('connection error:', err.message);
    state = false;
});
db.once('open', function callback () {
    console.log("Connected to DB!");
    state = true;
});

if (true || state) {
	var attachDB = function(req, res, next) {
		req.db = db;
		next();
	};
	app.all('/admin*', attachDB, function(req, res, next) {
		Admin.run(req, res, next);
	});
	app.all('/', attachDB, function(req, res, next) {
		res.redirect('/type-task');
	});	
	app.all('/tag-:id', attachDB, function(req, res, next) {
		Blog.run(req, res, next, "tags");
	});	
	app.all('/type-:id', attachDB, function(req, res, next) {
		Blog.run(req, res, next, "type");
	});
	app.all('/article-:id', attachDB, function(req, res, next) {
		Blog.runArticle(req, res, next);
	});		
	http.createServer(app).listen(parseInt(port), function() {
	  	console.log(
	  		'all right! your port is:', port
	  	);
	});
}

