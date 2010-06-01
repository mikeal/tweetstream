var tweetstream = require('tweetstream'),
    fs = require('fs'),
    path = require('path'),
    sys = require('sys');

var credentials = fs.readFileSync(path.join(__dirname, 'creds')).split(',');

var stream = tweetstream.createTweetStream({track:["twitter"], 
                                            username:credentials[0], 
                                            password:credentials[1].replace('\n','')});
stream.addListener("tweet", function (tweet) {sys.puts(sys.inspect(tweet))});
