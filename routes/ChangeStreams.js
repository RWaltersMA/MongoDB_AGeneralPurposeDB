var express = require('express');
var router = express.Router();
var settings=require('../config/config.js');  //change monogodb server location here
var jsonPrettyHtml = require('json-pretty-html').default;
var ObjectID = require('mongodb').ObjectID;

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
router.get('/poll', function (req,res, next)
{

    res.writeHead(200, { "Content-Type": "text/event-stream",
    "Cache-control": "no-cache", "Connection": "keep-alive" });

    var a=0;

    var MongoClient = require('mongodb').MongoClient;
    MongoClient.connect(settings.connectionString)
     .then(function(client){
       let db = client.db('MyStore')

       res.write('Stream opened on inventory collection');
       
       let change_streams = db.collection('inventory').watch({ fullDocument: 'updateLookup' })

          change_streams.on('change', function(change){              
            res.write(jsonPrettyHtml(change));
          });
         
      });

});


router.post('/delete', function (req,res)
{
    
    var MongoClient = require('mongodb').MongoClient;
    MongoClient.connect(settings.connectionString)
     .then(function(client){
         
            let db = client.db('MyStore');
            db.collection('inventory').findOne({}, function(err,doc) {

                if (doc==null)
                {
                    res.send(200,'No more documents to remove.');
                    res.end();
                    return; 
                }
                var o={ "_id" : ObjectID(doc._id) };

                db.collection('inventory').removeOne({ "_id": ObjectID(doc._id)}, function (err,obj)
                {
                    res.send(200,'Removed ' + obj.result.n + ' document');   
                    res.end();
                    return;
                })
            })
            })
            
        
});

router.post('/update', function (req,res)
{
    
    var MongoClient = require('mongodb').MongoClient;
    MongoClient.connect(settings.connectionString)
     .then(function(client){
         
            let db = client.db('MyStore')
            var InsertDB=db.collection('inventory').findOne({}, function(err,doc) {
                if (doc==null)
                {
                    res.send(200,'No documents left to update, insert some!');
                    res.end();
                    return; 
                }
    
                var o={ "_id" : ObjectID(doc._id) };
                var i=getRandomInt(100);
                
                db.collection('inventory').updateOne({ "_id": ObjectID(doc._id)}, { $set: { "InventoryCount" : i}}, function (err,results)
            {
               
                res.send(200,'Updating ' + jsonPrettyHtml(o ) + 'setting InventoryCount = ' + i);
               
                res.end();
                return;
            })
              
                
            })
            
        })
});

router.post('/insert', function (req,res)
{

    var MongoClient = require('mongodb').MongoClient;
    MongoClient.connect(settings.connectionString)
     .then(function(client){
         
            let db = client.db('MyStore')
            var newdoc={ "SKU" : getRandomInt(100000), "InventoryCount" : getRandomInt(10)};
            var InsertDB=db.collection('inventory').insert(newdoc).then(function (err)
            {
            
                if (err.result.ok!=1)
                {
                    res.send(500,err);
                    res.end();
                }
                else{
                    res.send(200,'Inserted document:<br>' + jsonPrettyHtml(newdoc));
                    res.end();
                    return;
                }
            });
     });
});

module.exports = router;