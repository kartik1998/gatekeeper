#!/usr/bin/env node
const express = require('express');
const ngrok = require('ngrok');
const fs = require('fs');

const app = express();

app.use(express.json());
app.use((req, res) => {
  const webhookData = {
    method: req.method,
    body: req.body,
    headers: req.headers,
  };
  console.log({ webhookData });
  return res.send('webhook recieved');
});

const PORT = 3009;
(async function () {
  const url = await ngrok.connect({
    addr: PORT,
  });
  console.log(url);
  fs.writeFileSync('./url.json', JSON.stringify({ url }));
}());

app.listen(PORT, console.log(`listening on port ${PORT}`));
