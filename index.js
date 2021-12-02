#!/usr/bin/env node
const express = require('express');
const ngrok = require('ngrok');
const EventEmitter = require('events');

const emitter = new EventEmitter();

const app = express();

app.use(express.json());

app.get('/webhooktest-ping-cl', (_, res) => res.send('pong'));

app.use((req, res) => {
  const webhookData = {
    method: req.method,
    body: req.body,
    headers: req.headers,
    query: req.query,
  };
  emitter.emit('fire', webhookData);
  return res.send('webhook recieved');
});

const PORT = 3009;
function getWebhookServerUrl() {
  return process.argv.includes('--local')
    ? `http://127.0.0.1:${PORT}`
    : ngrok.connect({
      addr: PORT,
    });
}
const webHookServerUrl = getWebhookServerUrl();
app.locals.settings.webHookServerUrl = webHookServerUrl;

module.exports = { app, emitter };
