var express = require('express')
var app = express();
var scripts = require('./scripts');
var db = require('./db');
var moment = require('moment');

app.set('json spaces', 40);

app.get('/',function (req,res) {
   res.end("Nothing here");
});

app.get('/leads', function (req, res) {
    scripts.getLeads(req,res);
});

app.get('/users',function(req,res){
   scripts.getUsers(req,res);
});

app.get('/test',function (req,res) {
    res.end("test");
});
db.connect(db.MODE_TEST, function(err) {
    if (err) {
        console.log('Unable to connect to MySQL.')
        process.exit(1)
    } else {
        app.listen(3000, function() {
            console.log('Listening on port 3000...')
        })
    }
});