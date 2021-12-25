const express = require('express');
const axios = require('axios').default;

const app = express();
const port = process.env.PORT || 5000;
requestLogger(require('http'));
requestLogger(require('https'));

app.get('/time/:time', async (req, res) => {
  const { time } = req.params;
  setTimeout(async () => {
    await axios.post(process.env.WEBHOOK_URL, {
      data: `response in ${time} + dt seconds`,
    });
  }, time * 1002);
  setTimeout(() => {
    res.json({ msg: `response in ${time} seconds` });
  }, time * 1000);
});

app.get('/ping', async (req, res) => res.send('pong'));

app.listen(port, () => console.log(`listening on port ${port}`));

function requestLogger(httpModule) {
  var original = httpModule.request;
  httpModule.request = function (options, callback) {
    console.log(options.href || options.proto + '://' + options.host + options.path, options.method);
    console.log('called this');
    if (options.headers) {
      options.headers['X-time-id'] = 'bar';
    }
    return original(options, callback);
  };
}

module.exports = app;
