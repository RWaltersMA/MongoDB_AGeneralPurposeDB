var MongoClient = require('mongodb').MongoClient;
var ObjectId = require('mongodb').ObjectId;

var connectionString = "mongodb://localhost:27017";

MongoClient.connect(connectionString, function (err, db) {
    if (err) throw err;
    var dbo = db.db("yelp");

    dbo.collection("business").find(
        { $and: [
            { 
                "longitude": { $exists: true }, 
                "latitude": {$exists:true} 
            },
            {
                "latitude":{$ne:null}, 
                "longitude":{$ne:null}
            }]})
    .project({"_id":1, "longitude":1, "latitude":1})
    .forEach(function (document) 
            {       
                console.log(document);
                dbo.collection("business").update({"_id": ObjectId(document._id)}, 
                    { $set: 
                        {
                            "location.type": "Point",
                            "location.coordinates":[document.longitude,document.latitude]
                        }
                    });
                });
    });
