const request = require('supertest');
const { expect } = require('chai');
const { AppModule } = require('../../build/src/index');
const app = require('../index');

const instance = AppModule.Instance({ debug: true });

describe('AppModule _sample tests', function () {
  this.timeout(100000);
  before(async () => {
    await instance.startWebhookServer();
    const ngrokUrl = await instance.getNgrokUrl();
    const localUrl = await instance.getLocalUrl();
    process.env.WEBHOOK_URL = ngrokUrl;
  });
  it('returns response in time in seconds specified in params', async () => {
    const response = await request(app).get('/time/1');
    expect(response.status).to.equal(200);
    const webhookResponse = await instance.wait();
    expect(webhookResponse.body.msg).to.equal('webhook triggered immediately');
    expect(webhookResponse.body.wait).to.equal('~0');
    const webhookResponse2 = await instance.wait();
    expect(webhookResponse2.body.msg).to.equal('webhook response in 1 + dt seconds');
    expect(webhookResponse2.body.wait).to.equal('1.002');
  });
});
