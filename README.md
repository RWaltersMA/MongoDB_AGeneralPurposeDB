# MongoDB - A General Purpose DB

The code behind a website that demonstrates MongoDB is a general purpose database: [http://www.mygiantidea.com](http://www.mygiantidea.com)

* [Introduction](#intro)

* [Getting Started](#gs)

* [Known Issues & Limitations](#issues)

* [Contacts](#contact)

* [Disclaimer](#disclaim)

## Introduction <a id="intro"></a>

## Getting Started <a id="gs"></a>

To install locally run `npm install`

You should have a MongoDB instance available and the [Yelp database](https://www.yelp.com/dataset/challenge) loaded.  This demo database is not included in this repository due to the size.

Create a [.env](.env) file which contains the connection credentials to your local MongoDB instance (see [dotenv](https://github.com/motdotla/dotenv)).  The contents of the file should be similar to the following:

```
    DB_HOST=127.0.0.1
    DB_PORT=27017
    DB_NAME=yelp
    DB_USERNAME=webuser
    DB_PASSWORD=webpassword
```

To run `node app.js`

### Creating Indexes and Other Setup Tasks
  
Text Search example requires an index.  Create one from the shell using:  

`db.business.createIndex({name:'text'})`

GraphLookup benefits greatly from a single field index.  Create one from the shell using:  

`db.users.createIndex({user_id:1})`

For Geospatial queries to work, a schema change is needed.  A special `2dsphere` index needs an object that adheres to the [GeoJSON](http://geojson.org/) standard.  For this you will need to execute our helper script that will copy the `longitude` and `latitude` fields into an object called `location`.  Inside `location` we will have a `type: "Point"` and an array called `coordinates` with the `longitude` and `latitude` as the only 2 elements.  

`node config/yelp_prep.js`

This will run against all 174K docs under the `business` collection.  Once this completes you can now create the 2dsphere index.  Create one from the shell using:  

`db.business.createIndex({location:'2dsphere'})`

## Known Issues & Limitations<a id="issues"></a>


List of issues, Limitations, and to-dos.

All issues and limitations have moved to the
[Issues](https://github.com/RWaltersMA/MongoDB_AGeneralPurposeDB/issues?q=is%3Aopen) part of this repo.

## Contacts <a id="contact"></a>


For technical questions, issues or just comments please post in the
[Issues](https://github.com/RWaltersMA/MongoDB_AGeneralPurposeDB/issues?q=is%3Aopen) section on GitHub.

## Disclaimer<a id="disclaim"></a>


This software is not supported by [MongoDB, Inc.](http://mongodb.com)
under any of their commercial support subscriptions or otherwise.
Any usage of MongoDB_AGeneralPurposeDB is at your own risk.
Bug reports, feature requests and questions can be posted in the
[Issues](https://github.com/RWaltersMA/MongoDB_AGeneralPurposeDB/issues?q=is%3Aopen) section on GitHub.