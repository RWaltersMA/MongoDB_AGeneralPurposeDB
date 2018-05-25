var express = require('express');
var mongo = require('mongodb');
var mongoClient = require('mongodb').MongoClient;
// I should be able to move this into a connection class...
var url = require('url'); //MongoDB Connection information
var settings = require('../config/config.js');  //change monogodb server location here
var Grid = require('gridfs-stream');
var fs = require('fs')  // file system module

var formidable = require('formidable'); // For dealing with the received file
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
        var fileName = files.file.name;
        console.log("Full file path = " + fullFilePath);


        mongoClient.connect(settings.connectionString, function (err, client) {

            assert.equal(null, err);
            if (err) throw err;

            var db = client.db(settings.database);

            // GridFS streaming utility
            var gfs = Grid(db, mongo);

            // streaming to gridfs
            var writestream = gfs.createWriteStream({
                filename: fileName,
                metadata: {
                    description: "Placeholder"
                }
            });

            fs.createReadStream(fullFilePath).pipe(writestream);
            console.log('-> Opened read and write file streams');

            writestream.on('close', function (file) {
                console.log('-> ' + file.filename + ' written to MongoDB');
            });
        });
    });
});


router.post('/Query', function (req, res, next) {
    console.log("In server query");

    var ResultSet = [];

    //var SearchCriteria=req.body.criteria;

    mongoClient.connect(settings.connectionString, function (err, client) {

        assert.equal(null, err);
        if (err) throw err;

        db = client.db(settings.database);

        console.log('-> Connected successfully to server');

        var Results = db.collection("fs.files").find({}).toArray().then(function (items) {

            items.forEach((item, idx, array) => {
                //console.log(item);
                ResultSet.push({
                    name: item['filename'],
                    uploadDate: item['uploadDate'],
                    description: item.metadata['description']
                });

            });
            //console.log(ResultSet);
            res.send(ResultSet); // sendStatus(201);
            res.end();
            client.close();            
        })
            .catch(function (e) {
                res.status(500).send(e);
                console.log(e);
            });
    }); //MongoClient
});

    module.exports = router;