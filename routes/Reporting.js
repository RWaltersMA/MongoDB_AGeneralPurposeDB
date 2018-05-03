var express = require('express');
var mysql      = require('mysql2');
var audit = require('../public/scripts/audit.js');
var settings=require('../config/config.js');
var fs=require('fs');
var router = express.Router();

var pool      =    mysql.createPool({
    connectionLimit: 10,
    host     : settings.host,
    port: 3307,
    user: 'rootadmin',
    password: settings.root_password,
    database : 'yelp',
    ssl      : {
        ca   : fs.readFileSync('/var/MongoSSL/mongodb.pem'),
        key  : fs.readFileSync('/var/MongoSSL/client-stripped.key'),
        cert : fs.readFileSync('/var/MongoSSL/client.crt')
    },
    authSwitchHandler: function ({pluginName, pluginData}, cb) {

      if (pluginName === 'mysql_clear_password') {
      // https://dev.mysql.com/doc/internals/en/clear-text-authentication.html
      var password = settings.root_password + '\0';
      var buffer = Buffer.from(password);
      cb(null, buffer);
    }
}
});

/* GET home page. */
router.get('/', function(req, res, next) { //  
         //If they jumped directly to a route and don't have a sessionID redirect them
    if (!req.session.sessionID) 
    {
        res.redirect('/');
        res.end();
        return;
    }
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

audit.writeAudit("Executed SQL Query: " + SQLQuery.replace(/['"]+/g, ''),0);


var IsFirst=true;
var DeliveredFields=false;


 pool.getConnection(function(err,connection){
        if (err) {
            console.log('error - ' + err);
                res.send( { Error: "Error in connection database" + err } );
                res.end;
                return;
                }  

       var query=pool.query({sql: SQLQuery, timeout: 40000})
      
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