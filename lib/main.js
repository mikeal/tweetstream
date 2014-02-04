var request = require('request'),
    events = require('events'),
    sys = require('sys'),
    qs = require('querystring'),
    url = require('url');

var end = '\r\n';

function createTweetStream (options) {
  var req;
  var buffer = '';
  var stopped = false;
  
  if (!options.uri) {
    if (options.chirp) {
      options.uri = 'http://chirpstream.twitter.com/2b/user.json';
    } else if (options.firehose) {
      options.uri = 'http://stream.twitter.com/1/statuses/firehose.json';
    } else if (options.links) {
      options.uri = 'http://stream.twitter.com/1/statuses/links.json';
    } else if (options.retweet) {
      options.uri = 'http://stream.twitter.com/1/statuses/retweet.json';
    } else if (options.follow || options.locations || options.track) {
      options.uri = 'http://stream.twitter.com/1/statuses/filter.json';
    } else {
      // Default to using the new chirp user stream
      options.chirp = true;
      options.uri = 'http://chirpstream.twitter.com/2b/user.json';
    }
  }
  
  if (typeof options.uri === "string") {
    options.query = options.query ? options.query : { count:options.count, follow: options.follow
      , track :     options.track ? options.track.join(',') : undefined
      , locations : options.locations ? options.locations.join(',') : undefined
      };
    // Hack (remove undefined values because they get set to noting by the stringify)
    for (k in options.query) {if (options.query[k] === undefined) {delete options.query[k]}}
    // Make sure that the query string gets stringified and escaped.
    var q = qs.stringify(options.query);
    if (q) options.uri += ('?' + q)
    options.uri = url.parse(options.uri);
  }
  
  options.uri.auth = options.username + ':' + options.password;
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
          stream.emit('line', blob);
        }
      }
    }
  })
  var tweetListener = function (blob) {
    if (stream.listeners("tweet").length > 0) {
      var tweet;
      try {tweet = JSON.parse(blob);}
      catch(e) {stream.emit('json-error', e, blob)}
      if (tweet) {
        stream.emit("tweet", tweet)
      }
    }
  }
  if (options.chirp) {
    var statusListener = function (status) {
      stream.emit("chirp-info", JSON.parse(status));
      stream.removeListener("line", statusListener);
      stream.addListener("line", tweetListener)
    }
    stream.addListener("line", statusListener)
  } else {
    stream.addListener("line", tweetListener)
  }
  
  stream.write = function (chunk) {stream.emit('data', chunk)};
  stream.end = function () {stream.emit("end")};
  stream.addListener("end", function () {
    stopped = true;
    options.client.end();
  })
  
  options.method = 'POST'; 
  options.headers = {'content-type':'application/json'};
  stream.readable = true;
  stream.writable = true;
  var start = function () {
    req = request(options, function (error, response, body) {
      if (!stopped) {
        delete options.client;
        setTimeout(start, options.delay)
      }
    });
    req.pipe(stream);
  }
  
  start();

  stream.rest = function (opts, callback) {
    var uri = url.parse(opts.uri);
    var method = opts.method;
    uri.auth = opts.auth ? opts.auth : options.uri.auth;
    uri.query = qs.stringify(opts);
    delete opts.uri
    
    return request({uri:uri, method:opts.method}, callback);
  }
  
  stream.rest.friendships = {
    create : function (opts, callback) {
      opts.uri = 'http://api.twitter.com/1/friendships/create/'+opts.id+'.json';
      delete opts.id;
      opts.method = 'POST'
      return stream.rest(opts, callback);
    }
  }

  return stream;
}

exports.createTweetStream = createTweetStream;
