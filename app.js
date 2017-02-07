var express = require('express');
var app = express()
var mongodb = require('mongodb');
var ObjectID=require('mongodb').ObjectID;
var MongoClient = require('mongodb').MongoClient;

var expressSession = require('express-session');
var MongoStore = require('connect-mongo')(expressSession);

var url = require('url');
var router = express.Router();


var index = require('./routes/index');
var textsearch = require('./routes/TextSearch');
var graphsearch = require('./routes/GraphSearch');
var facetsearch = require('./routes/FacetSearch');
var sparkintegration = require('./routes/SparkIntegration');
var geosearch = require('./routes/GeoSearch');
var constraints = require('./routes/Constraints');
var views = require('./routes/Views');
var joins = require('./routes/Joins');
var reporting = require('./routes/Reporting');
var welcome=require('./routes/Welcome');

var settings=require('./config/config');  //change monogodb server location here

app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');
app.use(express.static('public'));
var bodyParser = require('body-parser');
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
var db;
 
var connectionString = url.format({
    protocol: 'mongodb',
    slashes: true,
    hostname: settings.host,
    port: settings.port,
    pathname: settings.database
});

app.use(expressSession({
  
    secret: 'TheVegetarians',
    store: new MongoStore({
    host: '127.0.0.1',
    port: '27017',
    url: 'mongodb://localhost:27017/MyGiantIdeaSessionStore'}),
    resave: false,
    saveUninitialized: false
}));

app.use('/', index);
app.use('/TextSearch', textsearch);
app.use('/GraphSearch', graphsearch);
app.use('/FacetSearch', facetsearch);
app.use('/SparkIntegration', sparkintegration);
app.use('/GeoSearch', geosearch);
app.use('/Constraints', constraints);
app.use('/Views', views);
app.use('/Joins', joins);
app.use('/Reporting',reporting);
app.use('/Welcome',welcome);

  // Start the application after the database connection is ready
  app.listen(3000);
  console.log("Listening on port 3000");

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});



module.exports = app;
