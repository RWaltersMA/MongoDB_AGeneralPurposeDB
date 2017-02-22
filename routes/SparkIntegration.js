var exec = require('child_process').exec;
var express = require('express');
var router = express.Router();
var mongodb = require('mongodb');
var ObjectID=require('mongodb').ObjectID;
var MongoClient = require('mongodb').MongoClient;
var assert = require('assert');
var audit = require('../public/scripts/audit.js');

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
//This is the WebAPI that will tell if the View Recommends button should be enabled.  The UI will pole this API every few seconds.
router.get('/AnyRecommendations', function(req,res,next)
{
  var HasRecommendations=0;
  var IsRunningNow=0;
  var SessionID=req.session.sessionID;
  

MongoClient.connect(connectionString, function(err, database) {

    assert.equal(null, err);
    if(err) throw err;

    db = database;

  var ResultsPresent = db.collection("user_recommendations").find({"userId" : SessionID}).count().then( function(user_rec_count)
                {
                     if (user_rec_count>0)
                     {
                         HasRecommendations=1;
                            var SparkJobDone = db.collection("spark_progress").update({ "userId" : SessionID},{ $set: {"state":"stopped"}},{ upsert: false } );
                            res.send({"HasRecommendations":HasRecommendations, "IsRunning":0});
                            res.end();
                            db.close();
                            return;

                     }
                   // var SparkJobInProgress = db.collection("spark_progress").find({"userId":SessionID, "state":"running"}).count().then( function(sparkruncount)
                   var SparkJobInProgress = db.collection("spark_progress").findOne({"userId":SessionID}).then( function(sparkrun)
                     {
                         if (sparkrun.state=="error")
                         {
                             IsRunningNow=2;
                         }
                        if (sparkrun.state=="running")
                        {
                            IsRunningNow=1;
                        }
                    
                        res.send({"HasRecommendations":HasRecommendations, "IsRunning":IsRunningNow});
                        res.end();
                        db.close();
                     });

                });
}); //MongoClient
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
    var HasResults=0;
    var IsRunning=0;
    var StatusSet=[];
    var SessionID=req.session.sessionID;

    var TextSearchResults = db.collection("id_names").aggregate([{"$sample": {"size" : 10}}]).toArray().then(function (items) { 
 
            items.forEach((item, idx, array) => 
            {       
                ResultSet.push({
                        businessId: item['businessId'],
                        business_name: item['business_name']});

            });

            //Check to see if there are any results ready from a previous Spark Run, this will need to be updated to pass Session info for multi-user support
            var ResultsPresent = db.collection("user_recommendations").find({"userId" : SessionID}).count().then( function(thecount)
                {
                     if (thecount>0)
                     {
                         HasResults=1;
                         //Update the state to stopped // probably a much better way to do this.
                          var SparkJobDone = db.collection("spark_progress").update({ "userId" : SessionID},{ $set: {"state":"stopped"}},{ upsert: false } );
                            db.close();
           
                            res.render('spark', {ResultSet:ResultSet, HasResults: HasResults, IsRunning: 0} );
                            return;
                     }
                     //Determine if there is a spark job going on for this user
                     //spark_progress will be used to track how many spark jobs are executed and which ones are currently running for a given user
                     //state will be "running", "finished", "error"
                     //It is assumed that only 1 spark job for any 1 SessionID can be running
                     var SparkJobProgress = db.collection("spark_progress").find({"userId":SessionID, "state":"running"}).count().then( function(runningcount)
                     {
                        if (runningcount>0)
                        {
                            IsRunning=1;
                        }

                        db.close();
           
                        res.render('spark', {ResultSet:ResultSet, HasResults: HasResults, IsRunning: IsRunning} );
                     })
                     
                }
            )

        })
    .catch(function(e) {
         res.status(500).send(e);
         console.log(e);
});
}); //MongoClient
});

router.post('/ClearRecommendations/', function (req, res, next)
{
    
MongoClient.connect(connectionString, function(err, database) {

    assert.equal(null, err);
    if(err) throw err;

    db = database;

    var SessionID=req.session.sessionID;
    var DeleteAllRecommendations = db.collection("user_recommendations").remove( { userId: SessionID } ,function (err,doc) {

        //console.log("Error: " + err);
        res.send({});
        res.end();
        db.close();
        });

})

})

//This function will receive a JSON string describing the businessId and ratings and insert it into the user_recommendations colletion
router.post('/UploadRecommendations/', function (req, res, next){

    //Clean the user_recommendations collection

MongoClient.connect(connectionString, function(err, database) {

    assert.equal(null, err);
    if(err) throw err;

    db = database;

    var TheRatings=JSON.parse("[" + req.body.MyRatings + "]");  // When you insert multiple documents you need []

    //We need to update the ratings array with the session ID of the user
    var SessionID=req.session.sessionID;

    for (var i=0;i<TheRatings.length;i++)
    {
        TheRatings[i].userId=SessionID;
    }
   
    var DeleteAllResults = db.collection("personal_ratings").remove( { userId: SessionID }).then(function (err,doc) {

    //Clear the user recommendations collection for the given sessionID
    //var CleanUpRecommendations = db.collection("user_recommendations").remove( { userId: SessionID } );

    var InsertAllResults= db.collection("personal_ratings").insert(TheRatings).then (function(err, doc){

        res.send({});
        res.end();
       
        audit.writeAudit("Kicked off scala job for : " + req.session.user + " with a User ID=" + SessionID,0); 
        var SparkJobProgress = db.collection("spark_progress").update({ "userId" : SessionID},{ $inc: { "times_executed": 1 }, $set: {"state":"running"}},{ upsert: true } ).then(function (err,sparkdoc)
        {
                    exec('sh ~/CodeStaging/SparkReccEngine/submit-scala.sh -h ' + settings.host + ' -p ' + settings.port + ' -d ' + settings.database + ' -u ' 
                    + SessionID + ' > /tmp/spark-submit-$$.log 2>&1' ,function(err,stdout,stderr){
            
            var state="stopped";
            if (err)
            {
                audit.writeAudit("Error executing Scala job : " + err.message,1);
                state="error";
           
            }
            
                    if (stdout)
            {
                audit.writeAudit("Writing stdout from Scala job : " + stdout,0);
            }

                    if (stderr)
            {
                audit.writeAudit("Error with stderr : " + stderr,1);
            
            }
                var SparkJobDone = db.collection("spark_progress").update({ "userId" : SessionID},{ $set: {"state":state}},{ upsert: false } );

                db.close();
            });
        });

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


router.get('/GetRecommendations/', function (req,res, next){

var ResultSet=[];

//Run spark job to compute recommendations
//exec('sh ~/CodeStaging/SparkReccEngine/submit-scala.sh -h localhost -p 27017 -d yelp > /tmp/spark-submit-$$.log 2>&1' ,function(err,stdout,stderr){
    //  if (err) throw err;


      //Get newly computed recommendations
      MongoClient.connect(connectionString, function(err, database) {

          assert.equal(null, err);
          if(err) throw err;
      
          db = database;
      //db.id_names.find({"business_name" : /pizza/i })
          // Top 15 recommendations with names, with stars greater than or equal to 3 and given SessionID

          var SessionID=req.session.sessionID;
          var LookupResults = db.collection("user_recommendations").aggregate([
                    { '$match' : { 'userId': SessionID , 'review_stars' : { '$gte' : 2 }}},
                    { '$lookup' : {'from': 'id_names', 'localField': 'businessId', 'foreignField': 'businessId', 'as': 'business' }},
                    { '$unwind' : '$business' }, 
                    { '$project' : { '_id':0, 'userId':1, 'businessId':1, 'businessName': '$business.business_name', 'review_stars':1 }},
                    { '$sort': {'review_stars': -1, 'businessId': 1}},
                    { '$limit' : 15 }
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
               res.status(500).send(e);
               console.log(e);
          });
      }); //MongoClient
       

});
module.exports = router;

