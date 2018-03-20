# MongoDB - A General Purpose DB

The code behind a website that demonstrates MongoDB is a general purpose database: [http://www.mygiantidea.com](http://www.mygiantidea.com)

## Running Locally

To install locally run `npm install`

You should have a MongoDB instance available and the [Yelp database](https://www.yelp.com/dataset/challenge) loaded.  This demo database is not included in this repository due to the size.

Create a [.env](.env) file which contains the connection credentials to your local MongoDB instance (see [dotenv](https://github.com/motdotla/dotenv)).  The contents of the file should be similar to the following:

    DB_HOST=127.0.0.1
    DB_PORT=27017
    DB_NAME=yelp
    DB_USERNAME=webuser
    DB_PASSWORD=webpassword

To run `node app.js`

### Other Setup Tasks

* The Text Search example requires an index. Create one from the shell using `db.business.createIndex({name:'text'})`
