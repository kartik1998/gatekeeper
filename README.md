## G𝕒te𝕜ee𝕡er

[![Build Status](https://github.com/kartik1998/gatekeeper/actions/workflows/test.yml/badge.svg)](https://github.com/kartik1998/gatekeeper/actions/workflows/test.yml)

Capture your [webhooks](https://sendgrid.com/blog/whats-webhook) in your integration / end to end tests and write assertions for them.
Normally to test webhooks `webhook.site` or some similar platform is used, however you can't automate and write assertions over the data recieved through these webhooks. <br/>
P.S postman also offers a solution [link](https://learning.postman.com/docs/running-collections/collection-webhooks/) but I found the workflow a little time consuming.
Gatekeeper solves this problem via node's event emitter module and makes writing tests for webhooks seamless. [Sample gatekeeper webhook tests with chai, mocha and supertest](https://github.com/kartik1998/gatekeeper/blob/master/test/appModule.test.js)

## AppModule

- If you're writing your integration tests with (chai, mocha, supertest etc..) then you just need to import AppModule, `start the webhook server` and `wait` for webhooks via AppModules utility methods

#### Usage

- sample implementation: [link](https://github.com/kartik1998/gatekeeper/blob/master/test/appModule.test.js)

```js
const webhook = AppModule.Instance(); // webhook server by default runs on port 3009 (this is configurable, configurations listed below)

describe('user integration tests', function () {
  this.timeout(100000);
  before(async () => {
    await webhook.startWebhookServer();
    const localUrl = await webhook.getLocalUrl();
    process.env.WEBHOOK_URL = localUrl;
  });

  it('user test description', async () => {
    // synchronous api response assertions
    const response = await request(app).get('/endpoint');
    expect(response.status).to.equal(200);
    // synchronous api response assertions

    // assertions for webhooks recieved
    const webhookResponse = await webhook.wait();
    expect(webhookResponse.body).to.deep.equal(<what you expect webhook body to be>);
    expect(webhookResponse.headers).to.deep.equal(<what you expect webhook headers to be>);
  });
});
```

- Sample webhook.wait() result:

```json
{
  "method": "POST",
  "body": {
    "msg": "webhook"
  },
  "headers": {
    "Content-Type": "application/json"
  },
  "query": {}
}
```
