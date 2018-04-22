var express = require('express');
var router = express.Router();
var settings=require('../config/config.js');  //change monogodb server location here
var BSON=require('bson');
/*json-pretty-html*/

/* GET home page. */
router.get('/', function(req, res, next) {
    //If they jumped directly to a route and don't have a sessionID redirect them
    if (!req.session.sessionID) 
    {
        res.redirect('/');
        res.end();
        return;
    }
          res.render('aggframework', { title: 'MongoDB - General purpose database for GIANT IDEAS' });
     
});
router.post('/Query',function (req,res,next)
{
    var MongoClient = require('mongodb').MongoClient;
    MongoClient.connect(settings.connectionString)
     .then(function(client){
       let db = client.db('yelp');
       var query=req.body.query;
       try {
           
        var j=JSON.parse(query);

       } catch (error) {
        res.status(500).send(error);
        console.log(error);
        return;
       }
      
       var QueryResults = db.collection("business").aggregate([j]).toArray().then(
        function(docs) {

            res.send(JSON.stringify(docs)); // sendStatus(201);
          
            res.end();
            client.close();
        })
    .catch(function(e) {
         res.status(500).send(e);
         console.log(e);
    });
})
       
});

module.exports = router;