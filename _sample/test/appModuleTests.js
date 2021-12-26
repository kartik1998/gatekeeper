const request = require('supertest');
const { expect } = require('chai');
const { AppModule } = require('../../index');
const app = require('../index');

const web = new AppModule({ logWebHookToConsole: false, app });
console.log(web.getLocalWebhookUrl());

describe('AppModule _sample tests', function () {
  before(async () => {
    const webhookBaseUrl = await web.getNgrokWebhookUrl();
    process.env.WEBHOOK_URL = webhookBaseUrl;
  });
  this.timeout(10000);
  it('returns response in time in seconds specified in params', async () => {
    const response = await request(app).get('/time/1');
    expect(response.status).to.equal(200);
    const id = web.getGatekeeperId();
    const webhookResponse = await web.waitForWebHook();
    if (id !== webhookResponse.headers['x-gatekeeper-id']) {
      // it depends on user on how to handle this case. This probably means that a webhook of
      // a previous test has been recieved now. you can either throw an error in this case or just continue;
      // You can also handle this by just writing an assertion like:
      // expect(webhookResponse.headers['x-gatekeeper-id']).to.equal(id);
    } else {
      expect(webhookResponse.method).to.equal('POST');
      expect(webhookResponse.body.wait).to.equal('1.002');
    }
  });
});
