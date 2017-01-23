var express = require('express');
var app = express()
var mongodb = require('mongodb');
var ObjectID=require('mongodb').ObjectID;
var MongoClient = require('mongodb').MongoClient;

var url = require('url');
var router = express.Router();


var index = require('./routes/index');
var textsearch = require('./routes/TextSearch');
var graphsearch = require('./routes/GraphSearch');
var facetsearch = require('./routes/FacetSearch');
//var lookup = require('./routes/Lookup');
var sparkintegration = require('./routes/SparkIntegration');
var geosearch = require('./routes/GeoSearch');

//var parsesearch = multer(); // for parsing multipart/form-data

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


app.use('/', index);
app.use('/TextSearch', textsearch);
app.use('/GraphSearch', graphsearch);
app.use('/FacetSearch', facetsearch);
//app.use('/Lookup', lookup);
app.use('/SparkIntegration', sparkintegration);
app.use('/GeoSearch', geosearch);

/*
//Render home page 
app.get('/', function(request, response) {
        
          response.render('index', { title: 'MongoDB - General purpose database for GIANT IDEAS' });
     
        });

//Render Upload photo page
app.get('/new', function(request, response) {

    response.render('new');
})
*/
//Return values fom a text search

//Main Entry Point, create the MongoDB Connection and use connection-pooling from the driver
/*MongoClient.connect(connectionString, function(err, database) {

    assert.equal(null, err);
    if(err) throw err;

    db = database;*/

  // Start the application after the database connection is ready
  app.listen(3000);
  console.log("Listening on port 3000");
//});

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
