var express = require('express');
var mongo = require('mongodb');
var mongoClient = require('mongodb').MongoClient;
// I should be able to move this into a connection class...
var url = require('url'); //MongoDB Connection information
var settings=require('../config/config.js');  //change monogodb server location here
var Grid = require('gridfs-stream');
var fs = require('fs')  // file system module

var formidable = require('formidable'); // For dealing with the recieved file
var assert = require('assert');

var router = express.Router();
router.get('/', function (req, res, next) {
    res.render('gridfs');

});

router.post('/', function (req, res, next) {

    console.log('Entering post');
    //console.log(req);

    var form = new formidable.IncomingForm();
    form.parse(req, function (err, fields, files) {
        //console.log(files);
        var fullFilePath = files.file.path;
        console.log("Full file path = " + fullFilePath);


        mongoClient.connect(settings.connectionString, function(err, client) {

            assert.equal(null, err);
            if(err) throw err;
    
            var db = client.db(settings.database);
    
            // GridFS streaming utility
            var gfs = Grid(db, mongo);
    
            // streaming to gridfs
            var writestream = gfs.createWriteStream({
                filename: req.filename,
                metadata: {
                    description: "Placeholder"
                }
            });
    
            fs.createReadStream(fullFilePath).pipe(writestream);
            console.log('-> Opened read and write file streams');
    
            writestream.on('close', function(file) {
                console.log('-> ' + file.filename + ' written to MongoDB');
                process.exit();
            });
    
        });

        
    });

    


    /*
    var ResultSet=[];
    
    var SearchCriteria=req.body.criteria;
    
    MongoClient.connect(settings.connectionString, function(err, client) {
    
        assert.equal(null, err);
        if(err) throw err;
    
        db = client.db(settings.database);
    
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
                client.close();
            })
        .catch(function(e) {
             res.status(500).send(e);
             console.log(e);
            */
});
module.exports = router;