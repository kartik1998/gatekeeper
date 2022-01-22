import * as types from '../lib/types';
import * as utils from '../lib/utils';
import http from 'http';
import https from 'https';
import Base from './base';

export default class AppModule extends Base {
    public static _instance: AppModule;
    public webhookTestId: string = '';
    private constructor(opts: types.Options) {
        super(opts);
        this.setupExpressApp();
        this.enableWebhookHeaderModification();
    }

    public static Instance(opts: types.Options): AppModule {
        return this._instance || (this._instance = new AppModule(opts));
    }

    public createWebhookTestId(): string {
        this.webhookTestId = utils.uuid();
        return this.webhookTestId;
    }

    public getWebhookTestId(): string {
        return this.webhookTestId;
    }

    public enableWebhookHeaderModification() {
        this._interceptHttpRequests(http);
        this._interceptHttpRequests(https);
    }

    private _interceptHttpRequests(httpModule: any) {
        const original = httpModule.request;
        const self = this;
        httpModule.request = function (options: any, callback: any) {
            if (options.headers) {
                options.headers['x-webhooktest-id'] = self.getWebhookTestId();
            }
            return original(options, callback);
        };
        const originalGet = httpModule.get;
        httpModule.get = function (options: any, callback: any) {
            if (options.headers) {
                options.headers['x-webhooktest-id'] = self.getWebhookTestId();
            }
            return originalGet(options, callback);
        };
    }
}