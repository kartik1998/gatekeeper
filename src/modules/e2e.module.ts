import * as types from '../lib/types';
import Base from './base';

export default class E2EModule extends Base {
    public static _instance: E2EModule;
    private constructor(opts: types.Options) {
        super(opts);
        this.setupExpressApp();
    }

    public static Instance(opts: types.Options) {
        return this._instance || (this._instance = new E2EModule(opts));
    }
}