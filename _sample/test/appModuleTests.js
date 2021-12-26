const request = require('supertest');
const { expect } = require('chai');
const { AppModule } = require('../../index');
const app = require('../index');

const web = new AppModule({ logWebHookToConsole: false, app });
console.log(web.getLocalWebhookUrl());
console.log(web.getNgrokWebhookUrl());

describe('AppModule _sample tests', function () {
  this.timeout(10000);
  it('returns response in time in seconds specified in params', async () => {
    const response = await request(app).get('/time/1');
    expect(response.status).to.equal(200);
  });
});
