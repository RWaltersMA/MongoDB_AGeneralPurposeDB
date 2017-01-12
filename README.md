# images-gridfs-webapi
This is sample code to explore how you can store and retrieve images via a Web API with a MongoDB back end using the GridFS capabilities of the Node.JS driver.

To get this to run first modify the config.js file:


var settings = {
    host: '192.168.0.16',
    port: 27017,
    database: 'MyDocumentsDB'
};

and point to your MongoDB instance you wish to use.

Need to add more code to handle errors specifically unhandled exceptions.
