# TweetStream -- Stream API for twitter data.

## Install

<pre>
  npm install tweetstream
</pre>

## Tweet Stream

A **tweet stream** has the following methods, members, events, and usage.

    var tweetstream = require('tweetstream'),
        util = require('util');

    var stream = tweetstream.createTweetStream({ username:"twitterusername"
                                               , password:"mypassword" 
                                               });
    stream.addListener("tweet", function (tweet) {util.puts(util.inspect(tweet))});

### tweetstream.createTweetStream(options)

The first argument is an options object. The username and password options are required.

* `'username'` - A twitter username.
* `'password'` - The password for the provided twitter username.

Stream type options. The default stream type is the `'chirp` stream unless filter options are passed.

* `'chirp'` - boolean. default is true.
* `'firehose'` - boolean. Full twitter firehose, requires an account with escalated privileges.
* `'links'` - boolean. All tweets that contain a URI in the text, requires an account with escalated privileges.
* `'retweet'` - boolean. All tweets that are retweets, requires an account with escalated privileges.

Filter options. Using any of the following options will default to the filter stream.

* `'track'` - An array of keywords to track.
* `'follow'` - An array of userids to follow.
* `'locations'` - An array of locations to follow.


### Event: 'tweet'

`function (tweet) { }`

The `'tweet'` event emits a decoded JSON object from the '`status`' event.

### Event: 'chirp'

`function (info) { }`

When using the chirp stream the first line sent to the stream contains info about the user which is decoded and sent as `'info'` to this event.

### Event: 'line'

`function (line) { }`

The `'line'` event emits a utf8 string which is a *usually* a single twitter status message. This message *should* be in JSON format but is not decoded, if you intend to decode it you should use the '`tweet`' event.

### Event: 'data'

`function (data) { }`

The `'data'` event emits a `Buffer` directly from the HTTP stream. It includes the newlines sent as heartbeats.

