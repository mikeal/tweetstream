var tweetstream = require('tweetstream'),
    fs = require('fs'),
    path = require('path'),
    request = require('request'),
    sys = require('sys');

var credentials = fs.readFileSync(path.join(__dirname, 'creds')).split(',');
var username = credentials[0];
var password = credentials[1].replace('\n','');
var stream = tweetstream.createTweetStream({track:["osb2010", "osbridge"], 
                                            username:username, 
                                            password:password});
stream.addListener("tweet", function (tweet) {
  stream.rest.friendships.create({id:tweet.user.screen_name, user_id:tweet.user.id, follow:true}, 
    function (error, resp, body) {
      if (body) sys.puts(body);
  });
  var couch = 'http://'+username+':'+password+'@mikeal.couchone.com/osbtweets'
  tweet._id = tweet.id.toString();
  request({uri:couch, method:'POST', headers:{'content-type':'application/json'}, body:JSON.stringify(tweet)}, 
    function (e, resp, body) {
      if (resp && resp.statusCode !== 201) sys.puts(sys.inspect(resp), sys.puts(body));
      else {sys.puts(body)};
  })
});
