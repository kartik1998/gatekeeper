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

const promisify = (data) => new Promise((resolve) => resolve(data));

const PORT = 3009;
(async function () {
  const url = process.argv.includes('--local')
    ? await promisify(`http://127.0.0.1:${PORT}`)
    : await ngrok.connect({
      addr: PORT,
    });
  console.log({ pingUrl: `${url}/webhooktest-ping-cl` });
  fs.writeFileSync('/tmp/webhook-test-url.json', JSON.stringify({ url }));
}());

app.listen(PORT, console.log(`listening on port ${PORT} \ncreating ngrok url...`));

module.exports = app;
