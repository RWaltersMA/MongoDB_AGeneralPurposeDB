var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
     //If they jumped directly to a route and don't have a sessionID redirect them
    if (!req.session.sessionID) 
    {
        res.redirect('/');
        res.end();
        return;
    }
        
          res.render('views', { title: 'MongoDB - General purpose database for GIANT IDEAS' });
     
});

module.exports = router;