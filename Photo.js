
var Promise = require('bluebird');
var mongodb = Promise.promisifyAll(require('mongodb'));
var MongoClient = Promise.promisifyAll(require('mongodb').MongoClient);
var assert = require('assert');
var url = 'mongodb://198.168.0.16:27017/MyDocumentsDB';


module.exports= function() {
/*
    var P=[{
        filename: 'sfasdf.jpg',
        length: 21321
    }];

    return P;*/


       var Photos=[];

MongoClient.connect(url);
var mypromise=function(db) 
    {
        assert.equal(null, err);

        var bucket = new mongodb.GridFSBucket(db, 
        {
        chunkSizeBytes: 131072,
        bucketName: 'myfiles'
        });
        var d=bucket.find().toArray().then((docs) => {
       

       docs.forEach((item, idx, array) => 
       {
           var size = parseInt(item['length'], 10);
           size=size/1024; // Convert to kB

           Photos.push(
               {
                   length: size,
                   filename: item['filename']
                  
               }
           );
        });
        });

       db.close();

       return Photos;
      };
     // Promise.all(promises).then(
     // function() { return Photos; }
     // );
      //return Photos;
     
}

/***WORKS***** 
var MyPhotos=[{ 
        length: 500,
        filename: 'somefile.jpg'
    },{ length: 400,
        filename: 'somedddfile.jpg'
    }];
*/