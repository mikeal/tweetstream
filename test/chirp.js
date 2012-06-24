var tweetstream = require('tweetstream'),
    fs = require('fs'),
    path = require('path'),
    util = require('util');

var credentials = fs.readFileSync(path.join(__dirname, 'creds')).split(',');

var stream = tweetstream.createTweetStream({username:credentials[0], 
                                            password:credentials[1].replace('\n','')});
stream.addListener("tweet", function (tweet) {util.puts(util.inspect(tweet))});
