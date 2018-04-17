/* from pymongo import MongoClient

conn = MongoClient()
db = conn.yelp
coll = db.business

for doc in coll.find():
 coord = [doc['longitude'], doc['latitude']]
 location = { 'type': 'Point', 'coordinates': coord }
 coll.update({'_id':doc['_id']}, {'$set': { 'location': location }})
db.business.createIndex({'location': '2dsphere'}) */

var MongoClient = require('mongodb').MongoClient;
var ObjectId = require('mongodb').ObjectId;

var connectionString = "mongodb://localhost:27017";

MongoClient.connect(connectionString, function (err, db) {
    if (err) throw err;
    var dbo = db.db("yelp");
    var ResultSet = [];
    dbo.collection("business").find({ "location": { $exists: false } })
    .project({"_id":1, longitude:1, latitude:1})
    .limit(10)
    .toArray()
    .then(function (items) {
        items.forEach(function (item, idx, array) 
            {       
                ResultSet.push({
                        _id : item["_id"],
                        longitude: item["longitude"],
                        latitude: item["latitude"]});
                dbo.collection("business").update({"_id": ObjectId(item["_id"])}, 
                    { $set: 
                        {
                            "location.type": "Point",
                            "location.coordinates":[item["latitude"],item["longitude"]]
                        }
                    });
            });
        
        
        console.log(ResultSet);
        db.close();
      });
    });