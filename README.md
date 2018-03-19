# MongoDB - A General Purpose DB
A website that demonstrates MongoDB is a general purpose database.

This sample code hosts a website on port 3000.

This website connects with a MongoDB database and showcases some of the features that support MongoDB as a general purpose database. 

To install run `npm install`

You should have a MongoDB instance available and the [Yelp database](https://www.yelp.com/dataset/challenge) loaded.  This demo database is not included on Git due to the size.

## BEFORE YOU BEGIN
You will have to create a [.env](.env) file which contains the connection credentials to your local MongoDB instance (see [dotenv](https://github.com/motdotla/dotenv)).  The contents of the file should be similar to the following:

    DB_HOST=127.0.0.1
    DB_PORT=27020
    DB_NAME=yelp
    DB_USERNAME=webuser
    DB_PASSWORD=webpassword

To run `node app.js`

## Other Setup Tasks
* The Text Search example requires an index. Create one from the shell using `db.business.createIndex({name:'text'})`