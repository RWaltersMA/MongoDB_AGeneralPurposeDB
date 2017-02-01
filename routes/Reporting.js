var express = require('express');
var mysql      = require('mysql');
var router = express.Router();

var pool      =    mysql.createPool({
    connectionLimit : 10, //important
    host     : 'localhost',
    port: 3307,
    database : 'yelp',
    debug    :  false
});

/* GET home page. */
router.get('/', function(req, res, next) {
        
          res.render('reporting', { title: 'MongoDB - General purpose database for GIANT IDEAS' });
     
});

router.post('/QuerySQL', function (req,res,next) {

var ResultSet=[];
var Fields=[];

var SQLQuery=req.body.SQLQuery;

 pool.getConnection(function(err,connection){
        if (err) {
                res.send( { Error: "Error in connection database" } );
                res.end;
                return;
                }  

       // console.log('connected as id ' + connection.threadId);
        connection.query(SQLQuery, function (error, results, fields) {
      
        
            if (error)
            {
                res.send( { Error: error } );
                res.end;
                return;
            }
            
            for (var i=0;i<fields.length;i++)
            {
                Fields.push(fields[i].name);
            }
            for (var i=0;i<results.length;i++)
            {
                ResultSet.push(results[i]);
            }

        //console.log('The solution is: ', JSON.parse(JSON.stringify(results[0])));

            res.send( { Fields: Fields, QueryResults: ResultSet } );
            res.end(); 
                  connection.release();
        });
         connection.on('error', function(err) {      
            res.send( { Error: error } );
            res.end;
            return;  
        });
            
  });



/*
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
                        ReviewText: item['reviews.text']
                //});

            });

            res.send(ResultSet); // sendStatus(201);
            res.end();
            db.close();
        })
    .catch(function(e) {
            console.log(e);
  });
 });*/

});

module.exports = router;