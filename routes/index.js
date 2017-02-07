var express = require('express');
var router = express.Router();
var MongoClient = require('mongodb').MongoClient;
var url = require('url');
var assert=require('assert');

var settings=require('../config/config.js');  //change monogodb server location here
var db; 
var connectionString = url.format({
    protocol: 'mongodb',
    slashes: true,
    hostname: settings.host,
    port: settings.port,
    pathname: settings.database
});


/* GET home page. */
router.get('/', function(req, res, next) {

    if (req.session.user) {

        //A user exists, update the visitors collection

        MongoClient.connect(connectionString, function(err, database) {

            assert.equal(null, err);
            if(err) throw err;

            db = database;
            var d = new Date();

            //check to see if this user has been here before
            var CheckExistingUser = db.collection("visitors").findAndModify( { _id: req.session.user}, [], 
            {$set: { "last_login": d.toLocaleDateString() }, $inc: { "times_accessed":1} }, function (err,doc)
            {
                if (err)
                {
                    req.session.destroy();
                    res.render('welcome', { title: 'MongoDB - General purpose database for GIANT IDEAS' });
                    return;
                }
                res.render('index', { title: 'MongoDB - General purpose database for GIANT IDEAS' });

            });
            
            });
        } else {
            res.render('welcome', { title: 'MongoDB - General purpose database for GIANT IDEAS' });
        }

});

module.exports = router;