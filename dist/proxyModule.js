const http = require('http');
const url = require('url');
const utils = require('../lib/utils');

function ProxyModule(port) {
  this.port = port || 3008;
  this.server = http.createServer(this._handleIncomingRequest);
  this.server.listen(this.port, () => console.log(`proxy server initiated`));
}

ProxyModule.prototype._handleIncomingRequest = function (req, res) {
  const requestToHandle = url.parse(req.url);
  const headers = req.headers;
  headers['X-Gatekeeper-Id'] = utils.createId();
  const options = {
    method: req.method,
    headers,
    host: requestToHandle.hostname,
    port: requestToHandle.port || 80,
    path: requestToHandle.path,
  };
  const externalRequest = http.request(options, (externalRes) => {
    res.writeHead(externalRes.statusCode, externalRes.headers);
    externalRes.on('data', (chunk) => res.write(chunk));
    externalRes.on('end', () => res.end());
  });
  req.on('data', (chunk) => externalRequest.write(chunk));
  req.on('end', () => externalRequest.end());
};
