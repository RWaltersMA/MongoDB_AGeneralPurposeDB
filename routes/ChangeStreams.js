var express = require('express');
var router = express.Router();
var settings=require('../config/config.js');  //change monogodb server location here


function getRandomInt(max) {
    return Math.floor(Math.random() * Math.floor(max));
  }


/* GET home page. */
router.get('/', function(req, res, next) {
    //If they jumped directly to a route and don't have a sessionID redirect them
    if (!req.session.sessionID) 
    {
        res.redirect('/');
        res.end();
        return;
    }
          res.render('changestreams', { title: 'MongoDB - General purpose database for GIANT IDEAS' });
     
});
router.get('/poll', function (req,res)
{

    res.writeHead(200, { "Content-Type": "text/event-stream",
    "Cache-control": "no-cache", "Connection": "keep-alive" });

    var a=0;

    var MongoClient = require('mongodb').MongoClient;
    MongoClient.connect(connectionString)
     .then(function(client){
       let db = client.db('MyStore')
       
       // specific table for any change
       let change_streams = db.collection('inventory').watch()

          change_streams.on('change', function(change){        
            res.write(JSON.stringify(change));
          });

          
         console.log('here');
         
      });

        console.log('leaving');

});

router.post('/update', function (req,res)
{
    var MongoClient = require('mongodb').MongoClient;
    MongoClient.connect(connectionString)
     .then(function(client){
         
            let db = client.db('MyStore')
            var InsertDB=db.collection('inventory').findOne({}, function(err,doc) {
                var o=new ObjectID(doc._id);

                db.collection('inventory').updateOne({ "_id" : o}, { $set: { "InventoryCount" : getRandomInt(100)}}, function (err)
            {
                res.sendStatus(200);
                res.end();
                return;
            })
              
                
            })
            
        })
});

router.post('/insert', function (req,res)
{

    var MongoClient = require('mongodb').MongoClient;
    MongoClient.connect(connectionString)
     .then(function(client){
         
            let db = client.db('MyStore')
            var InsertDB=db.collection('inventory').insert({ "SKU" : getRandomInt(100000), "InventoryCount" : getRandomInt(10)}).then(function (err)
            {
            
                if (err.result.ok!=1)
                {
                    res.send(500,err);
                    res.end();
                }
                else{
                    
                    res.sendStatus(200);
                    res.end();
                    return;
                }
            });
     });
});

module.exports = router;