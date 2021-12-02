#!/usr/bin/env node
const express = require('express');
const ngrok = require('ngrok');
const fs = require('fs');
const crypto = require('crypto');

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
  const filePath = `/tmp/${crypto.randomBytes(25).toString('hex')}`;
  fs.writeFileSync(filePath, JSON.stringify(webhookData));
  console.log(webhookData);
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

module.exports = app;
