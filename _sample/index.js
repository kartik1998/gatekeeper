const express = require('express');
const axios = require('axios').default;

const app = express();

app.get('/time/:time', async (req, res) => {
  const { time } = req.params;
  setTimeout(() => {
    res.json({ msg: `response in ${time} seconds`, wait: time });
  }, time * 1000);
  triggerWebhook(time);
});

function triggerWebhook(time) {
  setTimeout(async () => {
    if (process.env.WEBHOOK_URL) {
      await axios.post(process.env.WEBHOOK_URL, {
        msg: `webhook response in ${time} + dt seconds`,
        wait: `${(time * 1002) / 1000}`,
      });
    } else {
      console.log(`mock webhook response in ${time} + dt seconds`);
    }
  }, time * 1002);
}

app.get('/ping', async (req, res) => res.send('pong'));

module.exports = app;
