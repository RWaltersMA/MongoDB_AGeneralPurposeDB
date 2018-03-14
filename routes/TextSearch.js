
var express = require('express');
var router = express.Router();
var mongodb = require('mongodb');
var ObjectID=require('mongodb').ObjectID;
var MongoClient = require('mongodb').MongoClient;
var assert = require('assert');

//MongoDB Connection information
var url = require('url');

var settings=require('../config/config.js');  //change monogodb server location here
var db; 
var connectionString = url.format({
    protocol: 'mongodb',
    slashes: true,
    hostname: settings.host,
    port: settings.port,
    pathname: settings.database
});

router.get('/', function (req,res,next) {
     //If they jumped directly to a route and don't have a sessionID redirect them
    if (!req.session.sessionID) 
    {
        res.redirect('/');
        res.end();
        return;
    }
       res.render('text', { title: 'MongoDB - General purpose database for GIANT IDEAS' });
  
})

router.post('/', function (req,res, next){

var ResultSet=[];

var SearchCriteria=req.body.criteria;

MongoClient.connect(connectionString, function(err, client) {

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
});
}); //MongoClient
 
})
module.exports = router;