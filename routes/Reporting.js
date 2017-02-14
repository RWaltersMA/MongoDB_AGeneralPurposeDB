var express = require('express');
var mysql      = require('mysql');
var audit = require('../public/scripts/audit.js');
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

/* This is called when the user issues a SQL statement */
router.post('/QuerySQL', function (req,res,next) {

var ResultSet=[];
var Fields=[];

var SQLQuery=req.body.SQLQuery;

if (~SQLQuery.toUpperCase().indexOf("LIMIT")) {
        res.send( { Error: "A LIMIT of 20 will be enforce on the query, do not specify one in your query." } );
        res.end;
        return;
} else  {
  SQLQuery+=" LIMIT 20";
}
//console.log(SQLQuery);

audit.writeAudit("Executed SQL Query: " + SQLQuery.replace(/['"]+/g, ''),0);


var IsFirst=true;
var DeliveredFields=false;


 pool.getConnection(function(err,connection){
        if (err) {
                res.send( { Error: "Error in connection database" } );
                res.end;
                return;
                }  

       var query=connection.query({sql: SQLQuery, timeout: 40000});
       query
  .on('error', function(err) {
      res.send( { Error: " " + err });
      res.end;
      return;
    // Handle error, an 'end' event will be emitted after this as well
  })
  .on('fields', function(fields) {
    // the field packets for the rows to follow
    // We only want to push the field headers once, so let's check to see if they've been sent yet
        if (DeliveredFields==false)
        {
             if (IsFirst==true)
            {
                res.write('[');
                IsFirst=false;
            }
            else{
                res.write(',');
            }
            for (var i=0;i<fields.length;i++)
                {
                    Fields.push(fields[i].name);
                }
            res.write ( JSON.stringify( { Fields: Fields } ));
            DeliveredFields=true;

    }
           
  })
  .on('result', function(row) {
    // Pausing the connnection is useful if your processing involves I/O
        connection.pause();

        if (IsFirst==true)
        {
            res.write('[');
            IsFirst=false;
        }
        else{
            res.write(',');
        }
        res.write(JSON.stringify({ QueryResults: row }));
     
        connection.resume();
 
  })
  .on('end', function() {

    connection.release();

    if (IsFirst==false) // If query is not formed correctly the return is blank so we need to make sure we only put a close bracket when there is data
        {
         res.end(']');
        }
        else{
            res.status(200);
        }
     
  });
 });
})

module.exports = router;