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
    callback: 'http://127.0.0.1:3000/results'
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
var aToken = '';
var aTokenSecret = '';
var username = '';

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

function List(id,slug) {
    this._id = id;
    this.slug = slug;
    this.tweets = [];
}

function Tweet(name,text,date,imageURL){
    this.name = name;
    this.text = text;
    this.date = date;
    this.imageURL = imageURL;
}

var myLists = [];

var accessToken = function(req,res,next,callback) {
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
            aToken = accessToken;
            aTokenSecret = accessTokenSecret;

            console.log("Authorized");
            twitter.verifyCredentials(accessToken, accessTokenSecret, function(error, data, results) {
                if(error) {
                    error = JSON.stringify(error);
                    console.log("Error getting User info : " + error);
                } else {
                    console.log("Logged in as " + data.screen_name)
                    username = data.screen_name;
                }
            });
            callback();
        }
    });
};

var getLists = function(req,res,next,callback){
    //API call to get the ids and names of a user's lists
    twitter.lists("list",{
            screen_name: username
        },
        aToken,
        aTokenSecret,
        function(error,data,response) {
            if(error) {
                error = JSON.stringify(error);
                console.log("Error getting List info : " + error);
            } else {
                for (var i=0;i<data.length;i++) {
                    var l = new List(data[i].id,data[i].slug);
                    myLists.push(l);
                    console.log(myLists[i]);
                }
                callback();
            }
        }
    );
};

var getTweets = function(req,res,next,callback) {
    if (!results.length === 0) {
        for(var i=0;i<results.length;i++) {
            twitter.lists("statuses",{
                    list_id: results[i]._id,
                    slug: results[i].slug
                },
                aToken,
                aTokenSecret,
                function(error,data,response) {
                    if(error) {
                        error = JSON.stringify(error);
                        console.log("Error getting Tweet info : " + error);
                    } else {
                        console.log(JSON.stringify(data));
                        /*console.log("Tweet: " data[0].text + 
                            "\n Tweeted by: " + data[0].user.name + 
                            "\n Tweeted at: " + data[0].created_at +
                            "\n Image URL: " + data[0].user.profile_image_url
                        );*/
                    } 
                }
            );
        }
        callback();
    } else { console.log("lol");}
}

app.use(express.static(path.join(__dirname, 'public')));

app.get('/', function (req, res, next) {
    requestToken(req,res, next);
    //res.sendFile(__dirname + '/views/index.html');
});

app.get('/results', function (req, res, next) {
    accessToken(req,res,next, function(){
        getLists(req,res, next,function(){
            getTweets(req,res,next,function(){
                res.sendFile(__dirname + '/views/results.html');
            });
        });
    });
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