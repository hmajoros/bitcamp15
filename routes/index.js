var express = require('express');
var router = express.Router();
var request = require('request');

/* GET home page. */
router.get('/', function(req, res, next) {
    res.render('index')
});

module.exports = router;

function getTweets(tag,callback){

    var base_url = "http://api.giphy.com/v1/gifs/search?q=";
    var api_key = "dc6zaTOxFJmzC";
    var giphy_url = base_url + tag + "&limit=1&api_key=" + api_key;

    var final_url = "null";

    request(giphy_url,function(error,response,body){
        if(!error && response.statusCode == 200) {
            var obj = JSON.parse(body);
            var obj2 = obj.data[0];
            var images = obj2.images;
            var fixed_height = images.fixed_height;
            var url = fixed_height.url;
            //console.log("callback about to execute");
            callback(url);
            //console.log("url was " + url);
        }
    })
}
