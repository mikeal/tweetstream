var request = require('request'),
    events = require('events'),
    sys = require('sys'),
    qs = require('querystring'),
    url = require('url');

var end = '\r\n';

function createTweetStream (options) {
  var buffer = '';
  var stopped = false;
  options.query = options.query ? options.query : { count:options.count, follow: options.follow
    , track :     options.track ? options.track.join(',') : undefined
    , locations : options.locations ? options.locations.join(',') : undefined
    };
  // Hack (remove undefined values because they get set to noting by the stringify)
  for (k in options.query) {if (options.query[k] === undefined) {delete options.query[k]}}
  // Make sure that the query string gets stringified and escaped.
  var uri = url.parse('http://stream.twitter.com/1/statuses/filter.json?' + qs.stringify(options.query));
  uri.auth = options.username + ':' + options.password;
  options.uri = uri;
  options.delay = options.delay ? options.delay : 1000 * 61;
  
  var stream = new events.EventEmitter();
  stream.addListener("data", function (chunk) {
    var blob;
    buffer += chunk.toString('utf8');
    if (buffer.indexOf(end) !== -1) {
      while (buffer.indexOf(end) !== -1) {
        blob = buffer.slice(0, buffer.indexOf(end));
        buffer = buffer.slice(buffer.indexOf(end) + end.length);
        if (blob.length > 0) {
          stream.emit('status', blob);
        }
      }
    }
  })
  stream.addListener("status", function (blob) {
    if (stream.listeners("tweet").length > 0) {
      var tweet;
      try {tweet = JSON.parse(blob);}
      catch(e) {stream.emit('json-error', e, blob)}
      if (tweet) {
        stream.emit("tweet", tweet)
      }
    }
  })
  stream.write = function (chunk) {stream.emit('data', chunk)};
  stream.end = function () {stream.emit("end")};
  stream.addListener("end", function () {
    stopped = true;
    client.end();
  })
  
  options.bodyStream = stream;
  options.method = 'POST'; 
  options.headers = {'content-type':'application/json'};
  
  var start = function () {
    request(options, function (error, response) {
      if (!stopped) {
        delete options.client;
        setTimeout(start, options.delay)
      }
    })
  }
  
  start();
  return stream;
}

exports.createTweetStream = createTweetStream;