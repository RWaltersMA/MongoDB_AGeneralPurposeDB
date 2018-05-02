var express = require('express');
var router = express.Router();
var settings=require('../config/config.js');  //change monogodb server location here
var BSON=require('bson');
var jsonPrettyHtml = require('json-pretty-html').default;
var assert = require('assert');

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
       var query=req.body.q;

       //JSON.parse expects a single JSON document, however in the agg framework we may have {},{},{} so we seperate by null when we pass to backend
       // split the string and form a proper array of JSON documents to parse
       try 
       {
        var strPipes = query.query.split("\0");
        var strPipeline="[";
        var isfirst=false;
        
        for (var i in strPipes) {        
            if (isfirst==false) 
            // Skip adding a comma if its the first pass
            {
                isfirst=true;
            }
            else
            {
                strPipeline+=",";
            }
            strPipeline+=strPipes[i];
        }
        strPipeline+="]";
       
        var t=JSON.parse(strPipeline);
       } 
       catch (error)
       {
        res.send('{ error: ' + error + '}');
        return;
       }
  
       var QueryResults = db.collection("business").aggregate(t).limit(5).toArray().then(  
       function (docs) {

            res.send(jsonPrettyHtml(docs));
          
            res.end();
            client.close();
       }).catch(function(e) {
              res.send('{ error: ' + e + '}');
        
         });
       
    });
})

module.exports = router;