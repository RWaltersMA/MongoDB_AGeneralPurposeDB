var url = require('url');

var settings = {
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    database: process.env.DB_NAME,
    username: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    root_username: process.env.ROOT_USERNAME,
    root_password: process.env.ROOT_PASSWORD,
    connectionString: 'mongodb://' + encodeURIComponent(process.env.DB_USERNAME) + ':' + encodeURIComponent(process.env.DB_PASSWORD) + '@' + process.env.DB_HOST +':' + process.env.DB_PORT
    
};

module.exports =settings;
