const express = require('express');
const axios = require('axios').default;

const app = express();
app.use(express.json());

app.get('/sample', async (req, res) => {
  const { webhookUrl } = req.query;
  if (!webhookUrl) return res.status(400).json({ error: 'webhookUrl required in request query' });
  const result = await axios.get(webhookUrl);
  return res.json({ webhookCallResponse: result.data });
});

const PORT = 3000;
app.listen(PORT, console.log(`listening on port ${PORT}`));
