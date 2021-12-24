const express = require('express');

const app = express();
const port = process.env.PORT || 5000;

app.get('/time/:time', async (req, res) => {
  const { time } = req.params;
  setTimeout(() => {
    res.json({ msg: `response in ${time} seconds` });
  }, time * 1000);
});

app.get('/ping', async (req, res) => res.send('pong'));

app.listen(port, () => console.log(`listening on port ${port}`));

module.exports = app;