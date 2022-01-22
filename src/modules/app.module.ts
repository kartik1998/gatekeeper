import * as types from '../lib/types';
import Base from './base';

export default class AppModule extends Base {
    public static _instance: AppModule;
    private constructor(opts: types.GateKeeperBaseOpts) {
        super(opts);
        this.setupExpressApp();
        this.startWebhookServer();
    }

    public static Instance(opts: types.GateKeeperBaseOpts) {
        return this._instance || (this._instance = new AppModule(opts));
    }
}