const { AppModule } = require('../index');
const app = require('./index');

const web = new AppModule({ logWebHookToConsole: false, app });
console.log(web.getLocalWebhookUrl());
console.log(web.getNgrokWebhookUrl());

(async function () {
  const res1 = await web.waitForWebHook();
  console.log({ res1 });
  const res2 = await web.waitForWebHook();
  console.log({ res2 });
}());
