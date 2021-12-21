/* eslint-disable no-underscore-dangle */
// TODO: add instrumentation: https://dev.to/henryjw/intercepting-http-requests-with-nodejs-21ba
const sp = require('synchronized-promise');
const express = require('express');
const ngrok = require('ngrok');
const EventEmitter = require('events');
const http = require('http');

/**
 * Singleton AppModule instance
 * @param {*} opts { port?: Number, localServer?: Boolean, logWebHookToConsole?: Boolean }
 */
function AppModule(opts = {}) {
  if (AppModule._instance) return AppModule._instance;
  this.locals = {
    emitter: new EventEmitter(),
    app: express(),
    port: opts.port || 3009,
    localServer: opts.localServer === true,
    logWebHookToConsole: opts.logWebHookToConsole,
  };
  this.setupExpressApp();
  this.locals.Server = http.createServer(this.locals.app);
  this.locals.Server.listen(this.locals.port);
  this.locals.webhookUrl = this.getWebhookServerUrlSync();
  this.locals.localUrl = `http://localhost:${this.locals.port}`;
  console.log(`webhook server running on url: ${this.locals.webhookUrl}, port: ${this.locals.port}`);
  AppModule._instance = this;
}

/**
 * sets up the express app instance. i.e. adds in required middlewares and routes
 */
AppModule.prototype.setupExpressApp = function () {
  const { app } = this.locals;
  app.use(express.json());
  app.get('/webhooktest-ping-gatekeeper-test-app', (_, res) => res.send('AoK'));
  app.use((req, res) => {
    const webhookData = {
      method: req.method,
      body: req.body,
      headers: req.headers,
      query: req.query,
    };
    if (this.locals.logWebHookToConsole) console.log(webhookData);
    if (req.headers['X-gatekeeper-test'] !== 'yes') this.locals.emitter.emit('fire', webhookData);
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
