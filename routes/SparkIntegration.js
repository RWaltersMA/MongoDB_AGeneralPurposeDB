var exec = require('child_process').exec;
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

/*
db.user_recommendations.aggregate([ {$match: {'review_stars' : {'$gte' : 3}}}, {$lookup: {from: 'id_names', 'localField': 'businessId', 'foreignField': 'businessId', as: 'business'}}, {$unwind:'$business'}, {$project: {_id:0, userId:1, businessId:1, 'name':'$business.business_name'}}])
*/
//Enumerate 10 restaurants in Arizona
router.get('/', function (req,res,next) {
       
MongoClient.connect(connectionString, function(err, database) {

    assert.equal(null, err);
    if(err) throw err;

    db = database;
    var ResultSet=[];

    var TextSearchResults = db.collection("id_names").find({"business_name" : /pizza/i }).toArray().then(function (items) { 
 
            items.forEach((item, idx, array) => 
            {       
                ResultSet.push({
                        businessId: item['businessId'],
                        business_name: item['business_name']});

            });

            db.close();
            res.render('spark', { ResultSet });
        })
    .catch(function(e) {
            console.log(e);
});
}); //MongoClient
});


//This function will receive a JSON string describing the businessId and ratings and insert it into the user_recommendations colletion
router.post('/UploadRecommendations/', function (req, res, next){

    //Clean the user_recommendations collection

MongoClient.connect(connectionString, function(err, database) {

    assert.equal(null, err);
    if(err) throw err;

    db = database;

    var TheRatings=JSON.parse("[" + req.body.MyRatings + "]");  // When you insert multiple documents you need []

    var DeleteAllResults = db.collection("personal_ratings").remove( { } ,function (err,doc) {

    var InsertAllResults= db.collection("personal_ratings").insert(TheRatings,function(err, doc){
  
        // res.sendStatus(200);//; // sendStatus(201);
         res.send({});
        res.end();
        db.close();
  });
    });
});

       
       
});



   

    /*Sample database	
  	"_id" : ObjectId("587edf8576aa11709e1df5b7"),
	"review_stars" : 5,
	"businessId" : 85433,
	"userId" : 3000000
*/


router.post('/', function (req,res, next){

var ResultSet=[];

//Run spark job to compute recommendations
exec('sh ~/CodeStaging/SparkReccEngine/submit-scala.sh -h localhost -p 27017 -d yelp > /tmp/spark-submit.log 2>&1' ,function(err,stdout,stderr){
      if (err) throw err;


      //Get newly computed recommendations
      MongoClient.connect(connectionString, function(err, database) {

          assert.equal(null, err);
          if(err) throw err;
      
          db = database;
      //db.id_names.find({"business_name" : /pizza/i })
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
       
   });
});
module.exports = router;
