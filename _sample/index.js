const { AppModule } = require('../index');

const web = new AppModule({ logWebHookToConsole: false });

(async function () {
  const res = await web.waitForWebHook();
  console.log({ res });
  const res1 = await web.waitForWebHook();
  console.log({ res1 });
})();
