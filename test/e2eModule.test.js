const http = require('http');
const { expect } = require('chai');
const { E2EModule } = require('../build/src/index');
const axios = require('axios').default;
const app = require('../_sample/index');

const webhook = E2EModule.Instance({ debug: true });
const port = 8080;

describe('E2EModule tests', function () {
  this.timeout(100000);
  before(async () => {
    http.createServer(app).listen(port);
    console.log(`api server running on port ${port}`);
    await webhook.startWebhookServer();
    const ngrokUrl = await webhook.getNgrokUrl();
    const localUrl = await webhook.getLocalUrl();
    process.env.WEBHOOK_URL = ngrokUrl;
  });

  after(() => {
    process.exit();
  });

  it('returns response in time in seconds specified in params (1 second) and triggers second webhook in 1.002 seconds', async () => {
    // synchronous api response assertions
    const response = await axios.get(`http://localhost:${port}/time/1`);
    expect(response.status).to.equal(200);
    // synchronous api response assertions

    // assertions for webhooks recieved
    const webhookResponse = await webhook.wait();
    expect(webhookResponse.body.msg).to.equal('webhook triggered immediately');
    expect(webhookResponse.body.wait).to.equal('~0');
    const webhookResponse2 = await webhook.wait();
    expect(webhookResponse2.body.msg).to.equal('webhook response in 1 + dt seconds');
    expect(webhookResponse2.body.wait).to.equal('1.002');
  });

  it('returns response in time in seconds specified in params (3 seconds) and triggers webhook second webhook in 3.006 seconds', async () => {
    // synchronous api response assertions
    const response = await axios.get(`http://localhost:${port}/time/3`);
    expect(response.status).to.equal(200);
    // synchronous api response assertions

    // assertions for webhooks recieved
    const webhookResponse = await webhook.wait();
    expect(webhookResponse.body.msg).to.equal('webhook triggered immediately');
    expect(webhookResponse.body.wait).to.equal('~0');
    const webhookResponse2 = await webhook.wait();
    expect(webhookResponse2.body.msg).to.equal('webhook response in 3 + dt seconds');
    expect(webhookResponse2.body.wait).to.equal('3.006');
  });
});
