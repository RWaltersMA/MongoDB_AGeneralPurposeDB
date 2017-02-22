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
    //Enumerate db.users.find( { $and: [{ $where: "this.friends.length < 4"}, { $where: "this.friends.length > 1"} ]} ).limit(10);
    //Fill an object to pass to UI
    
     //If they jumped directly to a route and don't have a sessionID redirect them
    if (!req.session.sessionID) 
    {
        res.redirect('/');
        res.end();
        return;
    }

MongoClient.connect(connectionString, function(err, database) {

    assert.equal(null, err);
    if(err) throw err;

    db = database;
    var ResultSet=[];

    var TextSearchResults = db.collection("users").find({
        "$and": [
    {"$where": "this.friends.length < 5"}, { $where: "this.friends.length > 1"}]}).limit(10).toArray().then(function (items) { 
 
            items.forEach((item, idx, array) => 
            {       
                ResultSet.push({
                        name: item['name'],
                        number_of_reviews: item['review_count'],
                        user_id: item['user_id'],
                        friends: item['friends']});

            });

            //res.send(ResultSet); // sendStatus(201);
           // res.end();
            db.close();
            res.render('graph', { ResultSet });
        })
    .catch(function(e) {
            console.log(e);
             res.status(500).send(e);
});
}); //MongoClient
});

router.post('/', function (req,res, next){

var ResultSet=[];

var UserIDToQuery=req.body.UserID;
var LevelsToQuery=req.body.Levels;


MongoClient.connect(connectionString, function(err, database) {

    assert.equal(null, err);
    if(err) throw err;

    db = database;

    var TextSearchResults = db.collection("users").aggregate([
        { '$match': {
                'user_id' : UserIDToQuery }
        },
        {'$graphLookup':
         { 'from': 'users',
                'startWith': [ UserIDToQuery] ,
                'connectFromField': 'friends',
                'connectToField': 'user_id',
                'as': 'socialNetwork',
                'maxDepth': Number(LevelsToQuery),
                'depthField':'depth'
        }
        }
        ,
      { '$project':
          {     '_id':0,
                'name':1,
                'Network':'$socialNetwork.name',
                'Depth':'$socialNetwork.depth'
    }}]).toArray().then(function (items) { 
 
            items.forEach((item, idx, array) => 
            {       
                ResultSet.push({
                       // name: item['name'],
                        depth: item['Depth'],
                        network: item['Network']});

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

})

module.exports = router;