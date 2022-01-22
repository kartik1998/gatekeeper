const request = require('supertest');
const { expect } = require('chai');
const { AppModule } = require('../../build/src/index');
const app = require('../index');

const instance = AppModule.Instance();

describe('AppModule _sample tests', function () {
  this.timeout(10000);
  before(async () => {
    await instance.startWebhookServer();
    const ngrokUrl = await instance.getNgrokUrl();
    const localUrl = await instance.getLocalUrl();
    process.env.WEBHOOK_URL = localUrl;
  });
  it('returns response in time in seconds specified in params', async () => {
    const response = await request(app).get('/time/1');
    expect(response.status).to.equal(200);
    const webhookResponse = await instance.wait();
    console.log(webhookResponse);
  });
});
