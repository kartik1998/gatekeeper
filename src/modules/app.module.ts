import * as types from '../lib/types';
import Base from './base';

export default class AppModule extends Base {
    public static _instance: AppModule;
    private constructor(opts: types.Options) {
        super(opts);
        this.setupExpressApp();
    }

    public static Instance(opts: types.Options) {
        return this._instance || (this._instance = new AppModule(opts));
    }
}