// const { AppModule } = require('../index');

// const web = new AppModule({ logWebHookToConsole: false });

// (async function () {
//   const res = await web.waitForWebHook();
//   console.log({ res });
//   const res1 = await web.waitForWebHook();
//   console.log({ res1 });
// })();

const express = require('express');
const app = express();
const port = process.env.PORT || 5000;

app.get('/time/:time', async function (req, res) {
  const { time } = req.params;
  setTimeout(function () {
    res.json({ msg: `response in ${time} seconds` });
  }, time * 1000);
});

app.get('/ping', async function (req, res) {
  return res.send('pong');
});

app.listen(port, () => console.log(`listening on port ${port}`));
