const request = require('supertest');
const { expect } = require('chai');
const { AppModule } = require('../../build/src/index');
const app = require('../index');

const webhook = AppModule.Instance({ debug: true });

describe('AppModule _sample tests', function () {
  this.timeout(100000);
  before(async () => {
    await webhook.startWebhookServer();
    const ngrokUrl = await webhook.getNgrokUrl();
    const localUrl = await webhook.getLocalUrl();
    process.env.WEBHOOK_URL = localUrl;
  });

  it('returns response in time in seconds specified in params', async () => {
    const webhookTestId = webhook.createWebhookTestId(); // create webhook test id
    // synchronous api response assertions
    const response = await request(app).get('/time/1');
    expect(response.status).to.equal(200);
    // synchronous api response assertions

    // assertions for webhooks recieved
    const webhookResponse = await webhook.wait();
    expect(webhookResponse.body.msg).to.equal('webhook triggered immediately');
    expect(webhookResponse.body.wait).to.equal('~0');
    expect(webhookResponse.headers['x-webhooktest-id']).to.equal(webhookTestId);
    const webhookResponse2 = await webhook.wait();
    expect(webhookResponse2.body.msg).to.equal('webhook response in 1 + dt seconds');
    expect(webhookResponse2.body.wait).to.equal('1.002');
    expect(webhookResponse2.headers['x-webhooktest-id']).to.equal(webhookTestId);
  });
});
