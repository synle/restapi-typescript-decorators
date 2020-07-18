var restify = require('restify');
var errs = require('restify-errors');



function between(min, max) {
  return Math.floor(Math.random() * (max - min) + min);
}

function respond(req, res, next) {
  const num = between(1, 10);
  if(num <= 4){
    res.send({ code: 'OK', message: 'SUCCESS' });
    next();
  } else {
    return next(new Error('FAILED'));
  }
}

var server = restify.createServer();
server.get('/hello', respond);
server.head('/hello', respond);

server.listen(8080, function() {
  console.log('%s listening at %s', server.name, server.url);
});
