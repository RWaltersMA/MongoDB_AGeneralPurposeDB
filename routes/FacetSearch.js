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
       res.render('facet', { title: 'MongoDB - General purpose database for GIANT IDEAS' });

})

//This function will accept a state abreviation and return a list of Cities in that State
router.post('/QueryCityList', function (req,res,next) {

var ResultSet=[];

var SearchCriteria=req.body.StateID;

MongoClient.connect(connectionString, function(err, database) {

    assert.equal(null, err);
    if(err) throw err;

    db = database;
    //db.runCommand ( { distinct: "business", key: "city", query: { state: "NC"} } )
    //Could also use Aggregation Framework: db.business.aggregate([{$group: {_id:"$city"}}, {$sort:{"_id":1}}])
    //db.business.aggregate([{$match: {"state": SearchCriteria }},{$group: {_id:"$city"}}, {$sort:{"_id":1}}])

    var FacetSearchResults = db.collection("business").distinct("city",{ "state": SearchCriteria },function(err, docs) {
        var v=docs.sort();

        v.forEach(function (item, index, array) {
                ResultSet.push({
                        City: item
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

var CitySearchCriteria=req.body.City;
var StateSearchCriteria=req.body.State;

MongoClient.connect(connectionString, function(err, database) {

    assert.equal(null, err);
    if(err) throw err;

    db = database;

console.log(StateSearchCriteria);
console.log(CitySearchCriteria);

    var FacetSearchResults = db.collection("business").aggregate( [
   
      {"$match": { "state": StateSearchCriteria, "city": CitySearchCriteria} },
      {"$facet" : {

         "ByCategories": [  { "$unwind" : "$categories" },
             { "$match" : {"categories" : { "$in" : ["Restaurants", "Food", "Bars", "Coffee & Tea", "Pizza", "Burgers", "Sandwiches"] }}},
             { "$sortByCount" : "$categories" } ],
         "ByStars": [ { "$bucket" : { "groupBy" : "$stars", boundaries: [ 1, 1.5, 2, 2.5, 3, 3.5, 4, 4.5, 5 ], "default" : 0 } } ],
         "ByPriceRange": [ { "$bucket" : { "groupBy" : "$attributes.Price Range", "boundaries" : [ 1, 2, 3, 4, 5 ], "default" : 0 } } ]
      }
   }]).toArray().then(function (items) {

            items.forEach((item, idx, array) =>
            {
                ResultSet.push({
                        Categories: item['ByCategories'],
                        Stars: item['ByStars'],
                        PriceRange: item['ByPriceRange']
                });

            });

            res.send(ResultSet); // sendStatus(201);
            res.end();
            db.close();
        })
    .catch(function(e) {
            console.log(e);
  });
 });
});

module.exports = router;
