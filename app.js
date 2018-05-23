var d=require('dotenv').config();
var express = require('express');
var app = express();

var expressSession = require('express-session');
var MongoDBStore = require('connect-mongodb-session')(expressSession);

//var appInsights = require("applicationinsights");
//appInsights.setup("bb6acade-454a-43e8-8667-10def6f43339").start();

var index = require('./routes/index');
var textsearch = require('./routes/TextSearch');
var graphsearch = require('./routes/GraphSearch');
var facetsearch = require('./routes/FacetSearch');
var geosearch = require('./routes/GeoSearch');
var constraints = require('./routes/Constraints');
var views = require('./routes/Views');
var joins = require('./routes/Joins');
var reporting = require('./routes/Reporting');
var welcome=require('./routes/Welcome');
var changestreams = require('./routes/changestreams');
var aggframework = require('./routes/aggframework');
var sparkintegration=require('./routes/SparkIntegration');
var about=require('./routes/About');
var ha=require('./routes/HighAvailability');
var settings=require('./config/config');  //change monogodb server location here

app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');
app.use(express.static('public'));
var bodyParser = require('body-parser');
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
var db;
var MongoSessionURI= 'mongodb://' + encodeURIComponent(settings.username) + ':' + encodeURIComponent(settings.password) + '@' + settings.host +':' + settings.port;


app.use(expressSession({
  
    secret: 'TheVegetarians',
    store: new MongoDBStore( {
        uri: MongoSessionURI, //'mongodb://$' + settings.username + ':' + settings.password + '@' + settings.host +':' + settings.port, // +'/MyGiantIdeaSessionStore',
        databaseName: 'MyGiantIdeaSessionStore',
        collection: 'mySessions'
    }),
    //url: 'mongodb://' + settings.username + ':' + settings.password + '@' + settings.host +':' + settings.port +'/MyGiantIdeaSessionStore'}),
    resave: false,
    saveUninitialized: false
}));

app.use('/', index);
app.use('/HighAvailability',ha);
app.use('/TextSearch', textsearch);
app.use('/GraphSearch', graphsearch);
app.use('/FacetSearch', facetsearch);
app.use('/GeoSearch', geosearch);
app.use('/Constraints', constraints);
app.use('/SparkIntegration', sparkintegration);
app.use('/About', about);
app.use('/Views', views);
app.use('/Joins', joins);
app.use('/Reporting',reporting);
app.use('/Welcome',welcome);
app.use('/changestreams',changestreams);
app.use('/aggframework',aggframework);

// Start the application after the database connection is ready
app.listen(3000);
console.log('Listening on port 3000');

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
