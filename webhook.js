const fs = require('fs');
const axios = require('axios').default;
const http = require('http');
const { app, emitter } = require('./index');

class AppModule {
  constructor(directory) {
    const server = http.createServer(app);
    server.listen(3009);
    this.directory = directory || '/tmp';
    this.serverUrl = JSON.parse(fs.readFileSync('/tmp/webhook-test-url.json', 'utf8')).url;
    this.webHookServerUrl = app.locals.settings.webHookServerUrl;
  }

  // eslint-disable-next-line class-methods-use-this
  wait(_timeout = 30000) {
    return new Promise((resolve) => {
      emitter.on('fire', (data) => {
        resolve(data);
      });
    });
  }

  pingWebhookServer() {
    axios.get(`${this.serverUrl}/webhooktest-ping-cl`).catch((err) => {
      console.log(`unable to ping webhook server ${this.serverUrl}`);
      throw err;
    });
  }
}

module.exports = AppModule;
