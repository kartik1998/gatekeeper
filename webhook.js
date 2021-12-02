const fs = require('fs');
const crypto = require('crypto');
const axios = require('axios').default;
const http = require('http');
const app = require('./index');

class WebHookTest {
  constructor(directory) {
    http.createServer(app);
    this.directory = directory || '/tmp';
    this.serverUrl = JSON.parse(fs.readFileSync('/tmp/webhook-test-url.json', 'utf8')).url;
    this.webHookServerUrl = app.locals.settings.webHookServerUrl;
  }

  wait(file, timeout = 30000) {
    const filePath = `${this.directory}/${file || crypto.randomBytes(25).toString('hex')}`;
    return new Promise((resolve, reject) => {
      const currentTime = Date.now();
      while (!fs.existsSync(filePath) && Date.now() - currentTime < timeout);
      // eslint-disable-next-line no-unused-expressions
      fs.existsSync(filePath)
        ? resolve(JSON.parse(fs.readFileSync(filePath, 'utf8')))
        : reject(new Error('failed to recieve webhook on time'));
    });
  }

  pingWebhookServer() {
    axios.get(`${this.serverUrl}/webhooktest-ping-cl`).catch((err) => {
      console.log(`unable to ping webhook server ${this.serverUrl}`);
      throw err;
    });
  }
}

module.exports = WebHookTest;
