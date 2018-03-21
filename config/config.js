var url = require('url');

var settings = {
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    database: process.env.DB_NAME,
    username: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    connectionString: 'mongodb://' + encodeURIComponent(process.env.DB_USERNAME) + ':' + encodeURIComponent(process.env.DB_PASSWORD) + '@' + process.env.DB_HOST +':' + process.env.DB_PORT
/*    url.format({
        protocol: 'mongodb',
        slashes: true,
        hostname: process.env.DB_HOST,
        port: process.env.DB_PORT,
        pathname: process.env.DB_NAME,
        username: encodeURIComponent(process.env.DB_USERNAME),
        password: encodeURIComponent(process.env.DB_PASSWORD)
    }) *///'mongodb://' + encodeURIComponent(process.env.DB_USERNAME) + ':' + encodeURIComponent(process.env.DB_PASSWORD) + '@' + process.env.DB_HOST +':' + process.env.DB_PORT

};

module.exports =settings;
