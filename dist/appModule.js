/* eslint-disable no-underscore-dangle */
const sp = require('synchronized-promise');
const express = require('express');
const ngrok = require('ngrok');
const EventEmitter = require('events');
const http = require('http');
const https = require('https');
const utils = require('../lib/utils');

/**
 * Singleton AppModule instance
 * @param {*} opts { port?: Number, localServer?: Boolean, logWebHookToConsole?: Boolean }
 */
function AppModule(opts = {}) {
  if (AppModule._instance) return AppModule._instance;
  if (!opts.app) throw new Error('AppModule requires an express "app" instance');
  this.locals = {
    emitter: new EventEmitter(),
    _app: express(),
    port: opts.port || 3009,
    localServer: opts.localServer === true,
    logWebHookToConsole: opts.logWebHookToConsole,
  };
  this.setupExpressApp();
  this.locals.Server = http.createServer(this.locals._app).listen(this.locals.port);
  this.locals.webhookUrl = this.getWebhookServerUrlSync();
  this.locals.localUrl = `http://localhost:${this.locals.port}`;

  console.log(`webhook server running on url: ${this.locals.webhookUrl}, port: ${this.locals.port}`);
  const self = this;

  (function InjectGatekeeperId() {
    Array.prototype.__gatekeeper__move__ = function (from, to) {
      this.splice(to, 0, this.splice(from, 1)[0]);
    };
    opts.app.use((req, _res, next) => {
      req.gatekeeperId = utils.createId();
      self.currentGatekeeperId = req.gatekeeperId;
      return next();
    });
    const len = opts.app._router.stack.length;
    opts.app._router.stack.__gatekeeper__move__(len - 1, 1);
  })();

  this.requestInterceptor(http);
  this.requestInterceptor(https);
  AppModule._instance = this;
}

AppModule.prototype.requestInterceptor = function (httpModule) {
  const original = httpModule.request;
  const self = this;
  httpModule.request = function (options, callback) {
    if (options.headers) {
      options.headers['X-Gatekeeper-Id'] = self.currentGatekeeperId;
    }
    return original(options, callback);
  };
};

AppModule.prototype.getLocalWebhookUrl = function () {
  return this.locals.localUrl;
};

AppModule.prototype.getNgrokWebhookUrl = function () {
  return this.locals.webhookUrl;
};

/**
 * sets up the express _app instance. i.e. adds in required middlewares and routes
 */
AppModule.prototype.setupExpressApp = function () {
  const { _app } = this.locals;
  _app.use(express.json());
  _app.get('/webhooktest-ping-gatekeeper-test-app', (_, res) => res.send('AoK'));
  _app.use((req, res) => {
    const webhookData = {
      method: req.method,
      body: req.body,
      headers: req.headers,
      query: req.query,
    };
    if (this.locals.logWebHookToConsole) console.log(webhookData);
    this.locals.emitter.emit('fire', webhookData);
    return res.send('webhook recieved');
  });
};

/**
 * @returns a promise of the webhookserver url
 */
AppModule.prototype.getWebhookServerUrl = function (locals) {
  const { localServer } = this.locals;
  if (localServer) return Promise.resolve(`http://127.0.0.1:${this.locals.port}`);
  return ngrok.connect({ addr: this.locals.port });
};

AppModule.prototype.getWebhookServerUrlSync = function () {
  const self = this;
  return sp(this.getWebhookServerUrl.bind(self))();
};

/**
 * @param {*} _timeout
 * @returns a promise when a webhook is recieved by the server
 */
AppModule.prototype.waitForWebHook = function (_timeout = 60000) {
  const self = this;
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      reject(new Error(`timeout of ${_timeout} ms exceeded.`));
    }, _timeout);
    self.locals.emitter.on('fire', (data) => {
      resolve(data);
    });
  });
};

module.exports = AppModule;
