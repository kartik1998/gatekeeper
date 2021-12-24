const { AppModule } = require('../index');
const app = require('./index');
const web = new AppModule({ logWebHookToConsole: false, app });

(async function () {
  const res1 = await web.waitForWebHook();
  console.log({ res1 });
  const res2 = await web.waitForWebHook();
  console.log({ res2 });
})();
