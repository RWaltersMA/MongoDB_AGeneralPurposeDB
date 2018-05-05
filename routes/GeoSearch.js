var express = require('express');
var router = express.Router();
var MongoClient = require('mongodb').MongoClient;
var assert = require('assert');

//MongoDB Connection information
var url = require('url');

var settings=require('../config/config.js');  //change monogodb server location here
var db;

router.get('/', function (req,res,next) {
    //If they jumped directly to a route and don't have a sessionID redirect them
    if (!req.session.sessionID) 
    {
        res.redirect('/');
        res.end();
        return;
    }
    res.render('geo', { title: 'MongoDB - General purpose database for GIANT IDEAS' });

});

//This function will accept a state abreviation and return a list of Cities in that State
router.post('/QueryBusinessList', function (req,res,next) {

    var ResultSet=[];

    MongoClient.connect(settings.connectionString, function(err, client) {

        assert.equal(null, err);
        if(err) throw err;

        db = client.db(settings.database);
        //db.runCommand ( { distinct: "business", key: "city", query: { state: "NC"} } )
        //Could also use Aggregation Framework: db.business.aggregate([{$group: {_id:"$city"}}, {$sort:{"_id":1}}])
        //db.business.aggregate([{$match: {"state": SearchCriteria }},{$group: {_id:"$city"}}, {$sort:{"_id":1}}])

        //  var BusinessListResults = db.collection("business").aggregate([{$match: { "state":"NV", "city":"Las Vegas"}},{$limit:10},{$group: {_id:"$name"}}, {$sort:{"_id":1}}],function(err, docs) {
  
        var BusinessListResults = db.collection('business').aggregate(
            [{$match: { 'state':'NV', 'city':'Las Vegas'}},{$limit:10},{$group: {_id:'$name'}},{$sort:{'_id':1}}]
        ).toArray().then(
            function(docs) {
      

                docs.forEach(function (item, index, array) {
                    ResultSet.push({
                        Business: item['_id']
                    });
           
                });

                res.send(ResultSet);
                res.end();
                client.close();
            });
    });
});

router.post('/', function (req,res, next){

    var ResultSet=[];
    var BusinessName=req.body.Business;
    var Distance=Number(req.body.Distance);

    MongoClient.connect(settings.connectionString, function(err, client) {

        assert.equal(null, err);
        if(err) throw err;

        db = client.db(settings.database);

        //Obtain the coordinates of the selected business

        var Coord=db.collection('business').findOne({ 'name' : BusinessName, 'state' : 'NV', 'city':'Las Vegas' }, {_id:0, longitude:1, latitude:1}, function(err,coord) {

            var GeoSearchResults = db.collection('business').aggregate([    {
                $geoNear: {  near: { type: 'Point', coordinates: [ coord.longitude,coord.latitude  ] },
                    distanceField: 'dist.calculated', 
                    maxDistance: Distance,
                    query: { },
                    includeLocs: 'dist.location', 
                    num: 10,
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
                client.close();
            })
                .catch(function(e) {
                    console.log(e);
                    res.status(500).send(e);
            
                });
        });
    });
});

module.exports = router;
