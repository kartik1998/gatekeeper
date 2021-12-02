const WebhookTest = require('../webhook');

const web = new WebhookTest();

(async function () {
  const url = await web.webHookServerUrl;
  console.log({ url });
  const res = await web.wait();
  console.log({ res });
  const test = await web.wait();
  console.log({ test });
}());
