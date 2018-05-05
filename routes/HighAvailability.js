var express = require('express');
var router = express.Router();

function mdbServiceControl(cmd,node) {
    // alert(cmd+node);      
    var mdbservice = 'mongod --replSet TestRS --port 27000 --dbpath env/r0 --fork --logpath env/r0/log/mongod.log --smallfiles --oplogSize 128';

    const exec = require('child_process').exec;
    const testscript = exec(mdbservice);

    testscript.stdout.on('data', function(data){
        console.log(data); 
        document.getElementById(node).innerHTML = data;
        // sendBackInfo();
    });
}

router.get('/', function (req, res, next) {
    //Enumerate db.users.find( { $and: [{ $where: "this.friends.length < 4"}, { $where: "this.friends.length > 1"} ]} ).limit(10);
    //Fill an object to pass to UI

    //If they jumped directly to a route and don't have a sessionID redirect them
    if (!req.session.sessionID) {
        res.redirect('/');
        res.end();
        return;
    }

    res.render('ha');
});

module.exports = router;