import express, { Application } from "express";
import EventEmitter from "events";
import * as types from '../lib/types';

export default abstract class Base {
    public emitter: EventEmitter;
    public _app: Application;
    public locals!: Partial<types.Locals>;

    constructor(opts: any) {
        this.emitter = new EventEmitter();
        this._app = express();
        this.locals.port = opts.port || 3009;
        this.locals.logWebHooksToConsole = opts.logWebhooksToConsole || false;
        if (!opts.expectedResponse) opts.expectedResponse = {};
        this.locals.expectedResponse = {
            status: opts.expectedResponse.status || 200,
            body: opts.expectedResponse.body || { msg: 'webhook recieved' }
        };
        this.locals.disableNgrok = opts.disableNgrok || false;
        this.locals.ngrokOpts = opts.ngrokOpts || {};
    }

    public setupExpressApp() {
        const _app = this._app;
        _app.use(express.json());
        _app.use((req, res) => {
            const webhookData = {
                method: req.method,
                body: req.body,
                headers: req.headers,
                query: req.query,
            };
            if (this.locals.logWebHooksToConsole) console.log(webhookData);
            this.emitter.emit('fire', webhookData);
            const status = this.locals.expectedResponse ? this.locals.expectedResponse.status : 200;
            const body = this.locals.expectedResponse ? this.locals.expectedResponse.body : { msg: 'webhook recieved' }
            return res.status(status).json(body);
        });
    }

    public abstract waitForWebhook(): Promise<any>;
}