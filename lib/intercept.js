/* eslint-disable no-underscore-dangle */
const { createInterceptor } = require('@mswjs/interceptors');
const { interceptXMLHttpRequest } = require('@mswjs/interceptors/lib/interceptors/XMLHttpRequest');
const { interceptClientRequest } = require('@mswjs/interceptors/lib/interceptors/ClientRequest');

function Intercept() {
  if (Intercept._instance) return Intercept._instance;
  this._interceptor = createInterceptor({
    resolver: () => {},
    modules: [interceptXMLHttpRequest, interceptClientRequest],
  });
  this.currentContextId = null;
  this._interceptor.on('request', this._handleHTTPRequest.bind(this));
  this._interceptor.on('response', this._handleHTTPResponse.bind(this));

  console.log('initialized gatekeeper context module');
  this._interceptor.apply();
  Intercept._instance = this;
}

/**
 * @param {*} request
 * intercepts http requests and injects context for webhooks, i.e. header: 'X-Gatekeeper-Id'
 */
Intercept.prototype._handleHTTPRequest = function (request) {
  const url = request.url.toString();
  const method = String(request.method);
  this.setCurrentContextId(request.id);
  request.headers.set('X-Gatekeeper-Id', this.getCurrentContextId());
  const headers = request.headers.raw();
  console.log({ url, method, headers });
};

Intercept.prototype.setCurrentContextId = function (id) {
  this.currentContextId = id ? `${Date.now()}-${id}` : null;
};

Intercept.prototype.getCurrentContextId = function () {
  return this.currentContextId;
};

Intercept.prototype._handleHTTPResponse = function (request, response) {
  response.headers.set('X-Gatekeeper-Id', this.getCurrentContextId());
  //   const responseEvent = {
  //     url: request.url.toString(),
  //     method: request.method,
  //     body: response.body,
  //     headers: response.headers.raw(),
  //     statusCode: response.status,
  //   };
  this.setCurrentContextId(null);
};

module.exports = Intercept;
