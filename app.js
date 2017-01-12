var express = require('express');
var app = express()
var mongodb = require('mongodb');
var ObjectID=require('mongodb').ObjectID;
var MongoClient = require('mongodb').MongoClient;
var assert = require('assert');
var url = require('url');
//var parsesearch = multer(); // for parsing multipart/form-data

var settings=require('./config.js');  //change monogodb server location here

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
//Render home page 
app.get('/', function(request, response) {
        
          response.render('index', { title: 'MongoDB - General purpose database for GIANT IDEAS' });
     
        });

//Render Upload photo page
app.get('/new', function(request, response) {

    response.render('new');
})

//Return values fom a text search
app.post('/TextSearch', function (req,res, next){

var ResultSet=[];

var SearchCriteria=req.body.criteria;

var TextSearchResults = db.collection("business").find({
    "$text": {
"$search": SearchCriteria } }).toArray().then(function (items) { 
 
       items.forEach((item, idx, array) => 
       {       
           ResultSet.push({
                name: item['name'],
                full_address: item['full_address'],
                city: item['city'],
                state: item['state'],
                
           categories: item['categories']});

       });

        res.send(ResultSet); // sendStatus(201);
        res.end();
       })
    .catch(function(e) {
            console.log(e);
});
 
})

//This function will remove a photo from the database for a given _id
app.get('/delete/:PhotoId', function (req, res) {
     
     try{
        
        var photo_id=new ObjectID(req.params.PhotoId);
        var grid = new mongodb.GridFSBucket(db);
        var PhotoFile = db.collection("fs.files", function (err,result) {
            if (err)
            {
                throw('Could not enumerate files collection');
                return false;
            }
            result.findOne({"_id" : photo_id}, function (err,thephoto) {
                if (err)
                {
                    throw('Could not find the _id');
                    return false;
                }

                grid.delete(photo_id,function (err) {
                    if (err){
                            throw('Could not delete the given _id');
                            }  
                                                    });
            });
        });
     }
     catch (e)
     {
         //Something went wrong, bad ID, etc so let's tell the user
         console.log(e);
     }
     res.redirect('/');
})

//Usage /photos/_id where _id is the ID saved in fs.files for the specific photo
//This method will need work to address error handling, for example passing unknown ID will throw an exception
app.get('/photos/:PhotoId', function (req, res) {
     
     try{
        var bucket = new mongodb.GridFSBucket(db);
        var photo_id=new ObjectID(req.params.PhotoId);
        var contentType="";
        // we need to make sure we get the right contentType and pass it to the header
        var PhotoFile = db.collection("fs.files", function (err,result) {
            if (err) { throw ('Could not enumerate files collection'); }
            result.findOne({"_id" : photo_id}, function (err,thephoto) {
                if (err) { throw('Could not find photo with specified _id'); }

                    contentType=thephoto['contentType'];
             }) }); 

            res.writeHead(200, {'Content-Type': contentType});//  i.e. 'image/jpg'
            bucket.openDownloadStream(photo_id).pipe(res);
      
     }
     catch (e)
     {
        res.writeHead(200, {'Content-Type':'text/html'});
        res.write('<html><body><p>Error reading photo : ' + e);
       res.end();
       return false;
     }

})

//Main Entry Point, create the MongoDB Connection and use connection-pooling from the driver
MongoClient.connect(connectionString, function(err, database) {

    assert.equal(null, err);
    if(err) throw err;

    db = database;

  // Start the application after the database connection is ready
  app.listen(3000);
  console.log("Listening on port 3000");
});