var app = require('../app');
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

/*
 * File Upload
 */
router.post('/', function (req, res, next) {

    console.log('Entering post');

    var form = new formidable.IncomingForm();
    form.parse(req, function (err, fields, files) {
        console.log(fields);
        var fullFilePath = files.file.path;
        var fileName = files.file.name;
        var fileSize = files.file.size;
        var chunksToUpload = fileSize / 65536;
        console.log("The file size is: " + fileSize);
        console.log("Uploadd chunks: " + chunksToUpload);
        console.log("Full file path = " + fullFilePath);
        console.log("File Description = " + fields.description);

        /*
        // 1 MB
        var maxFileSize = 1 * 1000 * 1000;

        if (fileSize > maxFileSize) {
            var message = "Aborting because the file size selected is too large";
            console.log (message);
            throw new Error(message);
        }*/


        mongoClient.connect(settings.connectionString, function (err, client) {

            assert.equal(null, err);
            if (err) throw err;

            var db = client.db(settings.database);

            //Delete previously uploaded files...
            pruneFiles(db);

            // GridFS streaming utility
            var gfs = Grid(db, mongo);

            // streaming to gridfs
            var writestream = gfs.createWriteStream({
                filename: fileName,
                metadata: {
                    description: fields.description
                }
            });

            var readstream = fs.createReadStream(fullFilePath)
            readstream.pipe(writestream);
            console.log('-> Opened read and write file streams');

            var totalRead = 0;

            readstream.on('data', function (chunk) {
                console.log('-> reading %d bytes of data', chunk.length);
                totalRead += chunk.length;
                var percentComplete = Math.round(totalRead / fileSize * 100);
                console.log('Percent complete', percentComplete);
                req.io.emit('PercentComplete', percentComplete);
            })

            readstream.on('end', function () {
                console.log('-> file read complete');
            })

            writestream.on('close', function (file) {
                console.log('-> ' + file.filename + ' written to MongoDB');
                res.end();
                client.close();
            });

        }); // MongoClient
    });
});

/*
 * File query
 */
router.post('/Query', function (req, res, next) {
    console.log("In server /Query");

    req.io.emit('news', 'Hello from GridFS.js!!!');

    var ResultSet = [];

    mongoClient.connect(settings.connectionString, function (err, client) {

        assert.equal(null, err);
        if (err) throw err;

        db = client.db(settings.database);

        console.log('-> Connected successfully to server');

        var Results = db.collection("fs.files").find({}).sort({ uploadDate: 1 }).limit(9999).toArray().then(function (items) {

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

/*
 * A utility method to keep the number of files uploaded to our demo server under control. It will be called whenever a
 * new upload is initiated
 */

function pruneFiles(db) {

    //TODO: Use a transaction when the database is upgraded to 4.0.

    // 1 hour old
    var ONE_HOUR = 60 * 60 * 1000; // ms
    var currentTime = new Date();

    var timestamp = new Date(currentTime - ONE_HOUR)// - 24*60*60 * 1000;
    var queryString = { uploadDate: { $lt: timestamp } };

    //TODO: Use a transaction when the database is upgraded to 4.0.
    // Find and delete the chunks associated with the files
    db.collection('fs.files').find(queryString).forEach(
        function (file) {
            console.log(file.filename, file.uploadDate);
            db.collection('fs.chunks').deleteMany({ files_id: file._id });
        },
        function (err) {
            console.log("Error", err);
        }
    );

    // Delete the files 
    db.collection('fs.files').deleteMany(queryString);
}

module.exports = router;
