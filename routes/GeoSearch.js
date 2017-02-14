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
       res.render('geo', { title: 'MongoDB - General purpose database for GIANT IDEAS' });

})

//This function will accept a state abreviation and return a list of Cities in that State
router.post('/QueryBusinessList', function (req,res,next) {

var ResultSet=[];

MongoClient.connect(connectionString, function(err, database) {

    assert.equal(null, err);
    if(err) throw err;

    db = database;
    //db.runCommand ( { distinct: "business", key: "city", query: { state: "NC"} } )
    //Could also use Aggregation Framework: db.business.aggregate([{$group: {_id:"$city"}}, {$sort:{"_id":1}}])
    //db.business.aggregate([{$match: {"state": SearchCriteria }},{$group: {_id:"$city"}}, {$sort:{"_id":1}}])

    var FacetSearchResults = db.collection("business").aggregate([{$match: { "state":"NV", "city":"Las Vegas"}},{$limit:10},{$group: {_id:"$name"}}, {$sort:{"_id":1}}],function(err, docs) {
       //var v=docs.sort();

      

        docs.forEach(function (item, index, array) {
                ResultSet.push({
                        Business: item["_id"]
                        });
           
        });

            res.send(ResultSet);
            res.end();
            db.close();
            })  
    })
})

router.post('/', function (req,res, next){

var ResultSet=[];
var BusinessName=req.body.Business;
var Distance=Number(req.body.Distance);

MongoClient.connect(connectionString, function(err, database) {

    assert.equal(null, err);
    if(err) throw err;

    db = database;

    //Obtain the coordinates of the selected business

    var Coord=db.collection("business").findOne({ "name" : BusinessName, "state" : "NV", "city":"Las Vegas" }, {_id:0, longitude:1, latitude:1}, function(err,coord) {

    var GeoSearchResults = db.collection("business").aggregate([    {
              $geoNear: {  near: { type: "Point", coordinates: [ coord.longitude,coord.latitude  ] },
              distanceField: "dist.calculated", 
              maxDistance: Distance,
              query: { },
              includeLocs: "dist.location", 
              num: 50,
              spherical: true      }    }, { $project: { name:1, dist:1 }} ]).toArray().then(function (items) {

            items.forEach((item, idx, array) =>
            {
               

                ResultSet.push({
                        BusinessName: item['name'],
                        DistanceToBusiness: item.dist.calculated,
                        BusinessCoord: item.dist.location.coordinates

                    //    Stars: item['ByStars'],
                      //  PriceRange: item['ByPriceRange']
                });

            });

            res.send(ResultSet); // sendStatus(201);
            res.end();
            db.close();
        })
    .catch(function(e) {
            console.log(e);
            res.status(500).send(e);
            
  });
 });
});
});

module.exports = router;
