const express = require('express');

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
app.listen(PORT, console.log(`listening on port ${PORT}`));
