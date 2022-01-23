## G𝕒te𝕜ee𝕡er

[![Build Status](https://github.com/kartik1998/gatekeeper/actions/workflows/test.yml/badge.svg)](https://github.com/kartik1998/gatekeeper/actions/workflows/test.yml)
![](https://img.shields.io/badge/npm-gatekeeper-orange)

Capture your [webhooks](https://sendgrid.com/blog/whats-webhook) in your integration / end to end tests and write assertions for them.
Normally to test webhooks `webhook.site` or some similar platform is used, however you can't automate and write assertions over the data recieved through these webhooks. <br/>
P.S postman also offers a solution [link](https://learning.postman.com/docs/running-collections/collection-webhooks/) but I found the workflow a little time consuming.
Gatekeeper solves this problem via node's event emitter module and makes writing tests for webhooks seamless. [Sample gatekeeper webhook tests with chai, mocha and supertest](https://github.com/kartik1998/gatekeeper/blob/master/test/appModule.test.js)

## Installation

```
npm install @kartikkhk/gatekeeper
```

## AppModule

- If you're writing your integration tests with (chai, mocha, supertest etc..) then you just need to import AppModule, `start the webhook server` and `wait` for webhooks via AppModules utility methods

#### Usage

- sample implementation: [link](https://github.com/kartik1998/gatekeeper/blob/master/test/appModule.test.js)
- Please note that `AppModule` is `singleton` in nature and the webhook's base url has to be updated by the user. <i> refer sample below </i>

```js
const { AppModule } = require('@kartikkhk/gatekeeper');
const webhook = AppModule.Instance(); // webhook server by default runs on port 3009 (this is configurable, configurations listed below)

describe('user integration tests', function () {
  this.timeout(100000);
  before(async () => {
    await webhook.startWebhookServer();
    const localUrl = await webhook.getLocalUrl();
    process.env.WEBHOOK_URL = localUrl; // or whatever your key for webhook url is like process.env.WEBHOOK_BASE_URL
  });

  it('user test description', async () => {
    // synchronous api response assertions
    const response = await request(app).get('/endpoint');
    expect(response.status).to.equal(200);
    // synchronous api response assertions

    // assertions for webhooks recieved
    const webhookResponse = await webhook.wait(); // default timeout of 1 minute
    /* can also be used like await webhook.wait(60 * 2000) //timeout of 2 minutes */
    expect(webhookResponse.body).to.deep.equal(<what you expect webhook body to be>);
    expect(webhookResponse.headers).to.deep.equal(<what you expect webhook headers to be>);
  });
});
```

- Sample `webhook.wait()` result:

```json
{
  "method": "POST",
  "body": {
    "msg": "webhook"
  },
  "headers": {
    "Content-Type": "application/json"
  },
  "query": {},
  "originalUrl": "/webhook/xyz"
}
```

#### AppModule Configuration

- Sample usage:

```js
const webhook = AppModule.Instance({ port: 5002, logWebhooksToConsole: true, disableNgrok: true... });
```

| Option               | Type                                                                                      | Description                                                                 |
| -------------------- | ----------------------------------------------------------------------------------------- | --------------------------------------------------------------------------- |
| port                 | number (default=3009)                                                                     | port on which webhook server runs on                                        |
| logWebhooksToConsole | boolean (default=false)                                                                   | Logs all recieved webhooks to console                                       |
| expectedResponse     | { status: number, body: any } (default= {status: 200, body: { msg: 'webhook recieved' }}) | The response that you want your webhook server to give your application     |
| disableNgrok         | boolean (default=false)                                                                   | Disables ngrok url creation for webhook server                              |
| ngrokOpts            | [view options here](https://www.npmjs.com/package/ngrok) (default={ addr: port })         | ngrok options                                                               |
| debug                | boolean (default=false)                                                                   | Writes gatekeeper debug and info logs to console (use only while debugging) |

<br>

| Method              | Description                                                                                                                                                                                                                                                                                                                                                     |
| ------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| createWebhookTestId | creates a unique uuid (webhookTestId) and attaches it to recieving webhooks headers. It's useful because it's possible that a `webhook.wait()`s timeout can exceed and the webhook is then recieved in the next test. Sample usage: [link](https://github.com/kartik1998/gatekeeper/blob/master/test/appModule.test.js)                                         |
| getWebhookTestId    | returns current webhookTestId                                                                                                                                                                                                                                                                                                                                   |
| startWebhookServer  | starts webhook server (if the server is already running then it just logs that the server is already running)                                                                                                                                                                                                                                                   |
| setExpectedResponse | you can use this to set the response that your application will get from webhook server, usage: webhook.setExpectedResponse(body, status)                                                                                                                                                                                                                       |
| getExpectedResponse | gets the expectedResponse                                                                                                                                                                                                                                                                                                                                       |
| wait                | Each recieved webhook is queued (if it isn't collected from `wait` method). i.e. when a webhook is recieved an event is emitted and if that event isn't consumed then the webhook is queued. Hence when the `wait` method is called it either collects webhook data from a queue or waits for a webhook event to fire. Hence each webhook is processed serially |
| getLocalUrl         | gets the webhook server's local url eg. `http://localhost:3009`                                                                                                                                                                                                                                                                                                 |
| getNgrokUrl         | gets the webhook server's ngrok url eg. `http://a985-122-161-75-46.ngrok.io`                                                                                                                                                                                                                                                                                    |

## E2EModule

- E2EModule is slightly different from AppModule. I recommend you use it when you want to test code running on an external server. (This means that you can use E2EModule for testing webhooks for an application written in any language since you're basically just making an api call and writing assertions over the response ;) )

#### Usage

- sample implementation: [link](https://github.com/kartik1998/gatekeeper/blob/master/test/e2eModule.test.js)
- Please note that `E2EModule` is `singleton` in nature and the webhook's base url has to be updated by the user. (This means you might have to ssh into your external server and replace your webhook url with the ngrok url. If you're sending the webhook url in your requests then you can ignore this step) <i> refer sample below </i>

```js
const { E2EModule } = require('@kartikkhk/gatekeeper');
const webhook = E2EModule.Instance();
describe('E2EModule user tests', function () {
  this.timeout(100000);
  before(async () => {
    await webhook.startWebhookServer();
    const ngrokUrl = await webhook.getNgrokUrl();
    console.log(ngrokUrl); // Place a debugger breakpoint here, copy the ngrokUrl and change the webhook url in your server, you can skip this step if you are sending the webhook url in your requests
  });

  after(() => {
    process.exit();
  });

  it('user test description', async () => {
    // synchronous api response assertions
    const response = await axios.get('http://<server-ip>:<port>/endpoint');
    expect(response.status).to.equal(200);
    // synchronous api response assertions

    // assertions for webhooks recieved
    const webhookResponse = await webhook.wait(); // default timeout of 1 minute
    /* can also be used like await webhook.wait(60 * 2000) //timeout of 2 minutes */
    expect(webhookResponse.body).to.deep.equal(<what you expect webhook body to be>);
    expect(webhookResponse.headers).to.deep.equal(<what you expect webhook headers to be>);
  });
});
```

#### E2EModule Configuration

- Sample usage:

```js
const webhook = E2EModule.Instance({ port: 5002, logWebhooksToConsole: true, disableNgrok: true... });
```

| Option               | Type                                                                                      | Description                                                                 |
| -------------------- | ----------------------------------------------------------------------------------------- | --------------------------------------------------------------------------- |
| port                 | number (default=3009)                                                                     | port on which webhook server runs on                                        |
| logWebhooksToConsole | boolean (default=false)                                                                   | Logs all recieved webhooks to console                                       |
| expectedResponse     | { status: number, body: any } (default= {status: 200, body: { msg: 'webhook recieved' }}) | The response that you want your webhook server to give your application     |
| ngrokOpts            | [view options here](https://www.npmjs.com/package/ngrok) (default={ addr: port })         | ngrok options                                                               |
| debug                | boolean (default=false)                                                                   | Writes gatekeeper debug and info logs to console (use only while debugging) |

<br>

| Method              | Description                                                                                                                                                                                                                                                                                                                                                     |
| ------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| startWebhookServer  | starts webhook server (if the server is already running then it just logs that the server is already running)                                                                                                                                                                                                                                                   |
| setExpectedResponse | you can use this to set the response that your application will get from webhook server, usage: webhook.setExpectedResponse(body, status)                                                                                                                                                                                                                       |
| getExpectedResponse | gets the expectedResponse                                                                                                                                                                                                                                                                                                                                       |
| wait                | Each recieved webhook is queued (if it isn't collected from `wait` method). i.e. when a webhook is recieved an event is emitted and if that event isn't consumed then the webhook is queued. Hence when the `wait` method is called it either collects webhook data from a queue or waits for a webhook event to fire. Hence each webhook is processed serially |
| getLocalUrl         | gets the webhook server's local url eg. `http://localhost:3009`                                                                                                                                                                                                                                                                                                 |
| getNgrokUrl         | gets the webhook server's ngrok url eg. `http://a985-122-161-75-46.ngrok.io`                                                                                                                                                                                                                                                                                    |
