var restify = require('restify');
var errs = require('restify-errors');

function between(min, max) {
  return Math.floor(Math.random() * (max - min) + min);
}

function respondWithNoExtraHeader(req, res, next) {
  const num = between(1, 10);
  if (num <= 4) {
    res.send({ code: 'OK', message: 'SUCCESS' });
    next();
  } else {
    res.status(500);
    res.send({ error: 'API failed' });
  }
}

function respondWithRetryAfterHeader(req, res, next) {
  const num = between(1, 10);
  if (num <= 2) {
    res.send({ code: 'OK', message: 'SUCCESS' });
    next();
  } else {
    const retryAfterSeconds = between(1, 5);
    res.status(500);
    res.header('Retry-After', retryAfterSeconds);
    res.send({ error: 'API failed', retryAfter: retryAfterSeconds });
    next();
  }
}

var server = restify.createServer();
server.get('/retry/no_extra_headers', respondWithNoExtraHeader);
server.get('/retry/retry_after_as_seconds', respondWithRetryAfterHeader);

server.listen(8080, function() {
  console.log('%s listening at %s', server.name, server.url);
});
