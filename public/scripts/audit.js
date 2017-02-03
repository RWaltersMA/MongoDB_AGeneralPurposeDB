var mongodb = require('mongodb');
var ObjectID=require('mongodb').ObjectID;
var MongoClient = require('mongodb').MongoClient;
var assert=require('assert');
var url = require('url');

var settings=require('../../config/config.js');  //change monogodb server location here
var db;
var connectionString = url.format({
    protocol: 'mongodb',
    slashes: true,
    hostname: settings.host,
    port: settings.port,
    pathname: settings.database
});


module.exports = 
{
writeAudit: function (audit_text,severity) 
  {

MongoClient.connect(connectionString, function(err, database) {

    assert.equal(null, err);
    if(err) throw err;

    db = database;
    var ResultSet=[];

    var TextSearchResults = db.collection("audit").insert({
        "message": audit_text, "severity" : severity, "timestamp" : new Date().toISOString().replace(/T/, ' ').replace(/\..+/, '')
    })
    .catch(function(e) {
            console.log(e);
    });
}); //MongoClient

  }

}
