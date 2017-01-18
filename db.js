var mysql = require('mysql');
var async = require('async');

var PRODUCTION_DB = 'leadDB'
    , TEST_DB = 'testDB';

exports.MODE_TEST = 'mode_test';
exports.MODE_PRODUCTION = 'mode_production';

var state = {
    pool: null,
    mode: null,
}

exports.connect = function(mode, done) {
    state.pool = mysql.createPool({
        host: 'localhost',
        user: 'dbuser',
        password: 'dbpwd',
        database: mode === exports.MODE_PRODUCTION ? PRODUCTION_DB : TEST_DB
    })

    state.mode = mode
    done()
}

exports.get = function() {
    return state.pool
};

exports.fixtures = function(data, done) {
    var pool = state.pool;
    if (!pool) return done(new Error('Missing database connection.'))

    var names = Object.keys(data.tables)
    async.each(names, function(name, cb) {
        async.each(data.tables[name], function(row, cb) {
            var keys = Object.keys(row)
                , values = keys.map(function(key) { return "'" + row[key] + "'" })
            pool.query("INSERT INTO " + name + " (" + keys.join(",") + ") VALUES (" + values.join(',') + ") ON DUPLICATE KEY UPDATE " + getUpdateString(keys,values), cb)
        }, cb)
    }, done)
}

exports.singleRow = function(query,done){
  var pool = state.pool;
  pool.query(query,done);
};

function getUpdateString(keys,values){
    var resultArray = [];
    for(i=0;i<keys.length;i++){
        resultArray.push(keys[i]+"="+values[i]);
    }
    return resultArray.join(",");
}

exports.drop = function(tables, done) {
    var pool = state.pool
    if (!pool) return done(new Error('Missing database connection.'))

    async.each(tables, function(name, cb) {
        pool.query('DELETE * FROM ' + name, cb)
    }, done)
}