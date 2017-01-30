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

/* GET home page. */
router.get('/', function(req, res, next) {
        
          res.render('joins', { title: 'MongoDB - General purpose database for GIANT IDEAS' });
     
});

router.post('/', function (req,res, next){

var ResultSet=[];

var CitySearchCriteria=req.body.City;
var StateSearchCriteria=req.body.State;

MongoClient.connect(connectionString, function(err, database) {

    assert.equal(null, err);
    if(err) throw err;

    db = database;
    
    var JoinSearchResults = db.collection("business").aggregate(
   [
		{
			"$match" : {
				"state" : StateSearchCriteria,
				"city" : CitySearchCriteria,
				"categories" : {
					"$in" : [
						"Pizza"
					]
				}
			}
		},
		{
			"$sort" : {
				"stars" : 1
			}
		},
		{
			"$limit" : 5
		},
		{
			"$lookup" : {
				"from" : "reviews",
				"localField" : "business_id",
				"foreignField" : "business_id",
				"as" : "reviews"
			}
		},
		{
			"$project" : {
				"name" : 1,
				"full_address" : 1,
				"stars" : 1,
				"reviews.text" : 1
			}
		}
	]).toArray().then(function (items) {

      

            items.forEach((item, idx, array) =>
            {
                // console.log(idx + " " + item);
            ResultSet.push({ item } ); /*
                ResultSet.push({
                        BusinessName: item['name'],
                        FullAddress: item['full_address'],
                        Stars: item['stars'],
                        ReviewText: item['reviews.text']*/
                //});

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