//THIS MAY NOT BE NEEDED

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
       res.render('text', { title: 'MongoDB - General purpose database for GIANT IDEAS' });
  
})

router.post('/', function (req,res, next){

var ResultSet=[];

MongoClient.connect(connectionString, function(err, database) {

    assert.equal(null, err);
    if(err) throw err;

    db = database;

    // Top 20 recommendations with names, with stars greater than or equal to 3
    var LookupResults = db.collection("user_recommendations").aggregate([
              { '$match' : { 'review_stars' : { '$gte' : 3 }}},
              { '$lookup' : {'from': 'id_names', 'localField': 'businessId', 'foreignField': 'businessId', 'as': 'business' }},
              { '$unwind' : '$business' }, 
              { '$project' : { '_id':0, 'userId':1, 'businessId':1, 'businessName': '$business.business_name', 'review_stars':1 }},
              { '$limit' : 20 }
            ]).toArray().then(function (items) { 
 
            items.forEach((item, idx, array) => 
            {       
                ResultSet.push({
                        userId: item['userId'],
                        businessId: item['businessId'],
                        businessName: item['businessName'],
                        review_stars: item['review_stars']
                });

            });

            res.send(ResultSet); // sendStatus(201);
            res.end();
            db.close();
        })
    .catch(function(e) {
            console.log(e);
});
}); //MongoClient
 
})
module.exports = router;
