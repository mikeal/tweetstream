# TweetStream -- Stream API for twitter data.

## Install

<pre>
  npm install tweetstream
</pre>

## Tweet Stream

A **tweet stream** has the following methods, members, events, and usage.

<script src="http://gist.github.com/409575.js"></script>

### tweetstream.createTweetStream(options)

The first argument is an options object. The username and password options are required, all others are optional but you'll need at least the track, follow, track or locations.

* `'username'` - A twitter username.
* `'password'` - The password for the provided twitter username.
* `'track'` - An array of keywords to track.

### Event: 'tweet'

`function (tweet) { }`

The `'tweet'` event emits a decoded JSON object from the '`status`' event.

### Event: 'status'

`function (status) { }`

The `'status'` event emits a utf8 string which is a single twitter status message. This message *should* be in JSON format but is not decoded, if you intend to decode it you should use the '`tweet`' event.

### Event: 'data'

`function (data) { }`

The `'data'` event emits a `Buffer` directly from the HTTP stream. It includes the newlines sent as heartbeats.
