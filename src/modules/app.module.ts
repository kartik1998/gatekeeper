import { Request, Response, Application, NextFunction } from 'express';
import * as types from '../lib/types';
import * as utils from '../lib/utils';
import http from 'http';
import https from 'https';
import Base from './base';

export default class AppModule extends Base {
    public static _instance: AppModule;
    public app?: Application;
    public webhookTestId: string = '';
    private constructor(opts: types.Options, app?: Application) {
        super(opts);
        this.setupExpressApp();
        this.app = app;
    }

    public static Instance(opts: types.Options, app?: Application): AppModule {
        return this._instance || (this._instance = new AppModule(opts, app));
    }

    public createWebhookTestId(): string {
        this.webhookTestId = utils.uuid();
        return this.webhookTestId;
    }

    public getWebhookTestId(): string {
        return this.webhookTestId;
    }

    public enableWebhookHeaderModification() {
        if (!this.app) throw new Error(`Express "app" object required`);
        const self = this;
        this.app.use((req: any, _res: Response, next: NextFunction) => {
            req.webhookTestId = self.getWebhookTestId();
            return next();
        });
        this.app._router.stack.unshift(this.app._router.stack.pop());
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
    }
}