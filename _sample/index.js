const { AppModule } = require('../index');

const web = new AppModule({ logWebHookToConsole: true });

(async function () {
  const res = web.waitForWebHook();
  console.log(res);
  const res1 = web.waitForWebHook();
  console.log(res1);
}());
