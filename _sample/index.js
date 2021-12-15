const { AppModule } = require('../index');

const web = new AppModule({ logWebHookToConsole: true });
console.log(web);
