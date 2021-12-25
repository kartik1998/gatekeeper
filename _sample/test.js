const { AppModule } = require('../index');
const app = require('./index');

const web = new AppModule({ logWebHookToConsole: false, app });
console.log(web.getLocalWebhookUrl());
console.log(web.getNgrokWebhookUrl());
process.env.WEBHOOK_URL = web.getNgrokWebhookUrl();

(async function () {
  const res1 = await web.waitForWebHook();
  console.dir({ res1 }, { depth: null });
  const res2 = await web.waitForWebHook();
  console.dir({ res2 }, { depth: null });
}());
