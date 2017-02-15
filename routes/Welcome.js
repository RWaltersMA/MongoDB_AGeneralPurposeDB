var express = require('express');
var assert=require('assert');
var router = express.Router();
var MongoClient = require('mongodb').MongoClient;
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

/* .User entered email address and hit continue*/
router.post('/', function(req, res, next) {
     
    var Email=req.body.email;
    var Survey=req.body; //, "UseCase" : req.body.UseCase };
   
   if (Email.length<5)
   {
    res.send({status: 0}); // sendStatus(201);
    res.end();
    return;
   } 

MongoClient.connect(connectionString, function(err, database) {

    assert.equal(null, err);
    if(err) throw err;

    db = database;
    var d = new Date();

     //check to see if this user has been here before
     var CheckIfExists=db.collection("visitors").findOne( { _id: Email} , function (err,doc)
     {
         if (!doc) //does not exist
         {
            //Get a new ID
            var GetUniqueID = db.collection("counters").findAndModify( { _id: "UniqueUserID" },[],
                { $inc: { "NextUserID": 1 }},{ new: true, upsert: true }, function (err,doc_id) {
                    if (err) // error getting next counter ID
                        {
                            req.session.sessionID=-1;
                            req.session.user="Unknown";
                           // res.render('index', { title: 'MongoDB - General purpose database for GIANT IDEAS' }); 
                            res.send({status: 1}); // sendStatus(201);
                            res.end();
                        }
                    //Add ID and information to visitors collection
                    db.collection("visitors").findAndModify( { _id: Email}, [], {$set: { "last_login": d.toLocaleDateString(), "userid" : doc_id.value.NextUserID, Survey }, $inc: { "times_accessed":1} },{ new: true, upsert: true } ,
                        function(err,doc_visitor) {
                                if (err) // Failed to write to visitors collection default to some values to continue
                                {
                                    req.session.sessionID=-1;
                                    req.session.user="Unknown";
                                }
                                else{
                                    req.session.sessionID=doc_visitor.value.userid;
                                    req.session.user=doc_visitor.value._id;
                                }
                                //res.render('index', { title: 'MongoDB - General purpose database for GIANT IDEAS' }); 
                                res.send({status: 1}); // sendStatus(201);
                                res.end();
                                return;
                                    });
                        
                })
         } // end of user does not exist
         else{
             
         //User exists so let's update visitor collection and set session variables
          db.collection("visitors").findAndModify( { _id: Email}, [], {$set: { "last_login": d.toLocaleDateString() }, $inc: { "times_accessed":1} },{ new: true, upsert: true } , function (err,doc_exists)
          {
              db.collection("visitors").findOne({_id: Email}, function (err,doc_visitor)
              {
           
                req.session.sessionID=doc_visitor.userid;  //ID #
                req.session.user=doc_visitor._id; // Email
              
               res.send({status: 1});
                res.end();
                return;
              })
           
              
          });
         }

     })
                   
         
         }) // MongoClient 
    })


module.exports = router;