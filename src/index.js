var http = require('http');
var fs = require('fs');

http.createServer(function (req, res) {
  if ("/" == req.url) {
    fs.readFile('./html/index.html', function(err, data) {
      res.writeHead(200, {'Content-Type': 'text/html'});
      res.write(data);
      return res.end();
    });
  }
}).listen(8080);
