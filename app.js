var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var session = require('express-session');

var app = express();

var twitterAPI = require('node-twitter-api');
var twitter = new twitterAPI({
    consumerKey: 'CFRzw4QBDkxDua8SFmbKuKqlh',
    consumerSecret: '2b5ZBt5tRRysTPQpLxG78u6wTjFRog1H68AyZNFyaiyMj5TsHn',
    callback: 'http://127.0.0.1:3000/login'
});

// uncomment after placing your favicon in /public
//app.use(favicon(__dirname + '/public/favicon.ico'));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());

app.use(session({
    secret: 'dev',
    resave: true,
    saveUninitialized: true
}));

var rToken = '';
var rTokenSecret = '';

var requestToken = function(req, res, next) {
    twitter.getRequestToken(function(error, requestToken, requestTokenSecret, results){
        if (error) {
            error = JSON.stringify(error);
            console.log("Error getting OAuth request token : " + error);
        } else {
            //store token and tokenSecret somewhere, you'll need them later; redirect user 
            rToken = requestToken;
            rTokenSecret = requestTokenSecret;
            console.log("Access Token & Secret:\n"+rToken+ '\n' + rTokenSecret);
            res.redirect("https://twitter.com/oauth/authenticate?oauth_token=" + rToken);
        }
    });
};

var accessToken = function(req,res,next) {
    if(!req.query.oauth_token || !req.query.oauth_verifier) {
        res.sendFile(__dirname + '/views/error.html');
    }

    console.log("REQUEST TOKEN IS " + rToken);
    var requestToken = rToken;
    var requestTokenSecret = rTokenSecret;
    var oauth_verifier = req.query.oauth_verifier;

    twitter.getAccessToken(requestToken, requestTokenSecret, oauth_verifier, function(error, accessToken, accessTokenSecret, results) {
        if (error){
            error = JSON.stringify(error);
            console.log("Error getting Access token : " + error);
        } else {
            console.log("Authorized");
            twitter.verifyCredentials(accessToken, accessTokenSecret, function(error, data, results) {
                if(error) {
                    error = JSON.stringify(error);
                    console.log("Error getting User info : " + error);
                } else {
                    console.log("Logged in as " + data.screen_name)
                }
            });
        }
    });
};

app.use(express.static(path.join(__dirname, 'public')));

app.get('/', function (req, res, next) {
    requestToken(req,res, next);
    //res.sendFile(__dirname + '/views/index.html');
});

app.get('/login', function (req, res, next) {
    accessToken(req,res, next);
    res.sendFile(__dirname + '/views/login.html');
});

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
  app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.sendFile(__dirname + '/views/error.html');
  });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
  res.status(err.status || 500);
  res.sendFile(__dirname + '/views/error.html');
});


module.exports = app;