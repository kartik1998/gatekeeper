const WebhookTest = require('../webhook');

const web = new WebhookTest();

(async function () {
  const url = await web.webHookServerUrl;
  console.log(url);
  // const res = await web.wait('ad1a8f47fc26e67fd8ab784b5f1d97af74788ae87093681543');
  // console.log({ res });
}());
