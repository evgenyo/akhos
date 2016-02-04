var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');

var app = express();

var mongoose = require('mongoose');
var passport = require('passport');

// var database = require('./config/database');

// if (app.get('env') === 'development') {
//     mongoose.connect('mongodb://localhost/akhos-dev', function(err, db) {
//         if (!err) {
//             console.log('Connected to mongodb!');
//         } else {
//             console.dir(err);
//         }
//     });
// } else {
//     mongoose.connect(database.url);
// }

mongoose.connect("mongodb://evgenyo:letitwork@ds055515.mongolab.com:55515/akhos-production");

require('./models/Posts');
require('./models/Comments');
require('./models/Users');
require('./config/passport');

var routes = require('./routes/index');

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(favicon(__dirname + '/public/images/logo.ico'));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
    extended: false
}));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(passport.initialize());

app.use('/', routes);

app.use(function(req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});

if (app.get('env') === 'development') {
    app.use(function(err, req, res, next) {
        res.status(err.status || 500);
        res.render('error', {
            message: err.message,
            error: err
        });
    });
}

app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
        message: err.message,
        error: {}
    });
});


module.exports = app;
