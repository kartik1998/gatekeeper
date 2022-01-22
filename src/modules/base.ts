import express, { Application } from 'express';
import ngrok from 'ngrok';
import EventEmitter from 'events';
import http from 'http';
import Queue from '../lib/queue';
import * as types from '../lib/types';

export default abstract class Base {
    private _emitter: EventEmitter;
    public _app: Application;
    public locals!: Partial<types.Locals>;
    public localUrl?: Promise<string>;
    public ngrokUrl?: Promise<string>;
    public _webhookTimeout: number = 60 * 1000;
    private _queue: Queue;

    constructor(opts: types.GateKeeperBaseOpts) {
        this._emitter = new EventEmitter();
        this._app = express();
        this.locals.port = opts.port || 3009;
        this.locals.logWebHooksToConsole = opts.logWebHooksToConsole || false;
        if (!opts.expectedResponse) opts.expectedResponse = {};
        this.locals.expectedResponse = {
            status: opts.expectedResponse.status || 200,
            body: opts.expectedResponse.body || { msg: 'webhook recieved' },
        };
        this.locals.disableNgrok = opts.disableNgrok || false;
        this.locals.ngrokOpts = opts.ngrokOpts || {};
        this._queue = new Queue();
    }

    public setupExpressApp() {
        const _app = this._app;
        const handleWebhook = this._handleRecievedWebhook;
        _app.use(express.json());
        _app.use((req, res) => {
            const webhookData = {
                method: req.method,
                body: req.body,
                headers: req.headers,
                query: req.query,
            };
            if (this.locals.logWebHooksToConsole) console.log(webhookData);
            handleWebhook(webhookData);
            const status = this.locals.expectedResponse ? this.locals.expectedResponse.status : 200;
            const body = this.locals.expectedResponse ? this.locals.expectedResponse.body : { msg: 'webhook recieved' };
            return res.status(status || 200).json(body);
        });
    }

    private _handleRecievedWebhook(webhookData: any) {
        const result = this._emitter.emit('webhook', webhookData);
        if (!result) {
            this._queue.enqueue(webhookData);
        }
    }

    public async startWebhookServer() {
        http.createServer(this._app).listen(this.locals.port);
        this.localUrl = Promise.resolve(`http://localhost:${this.locals.port}`);
        if (!this.locals.disableNgrok) {
            const opts = { addr: this.locals.port, ...this.locals.ngrokOpts }
            this.ngrokUrl = ngrok.connect(opts);
            console.log(`webhook server running on ${await this.localUrl}, ngrok url: ${await this.ngrokUrl}`);
        } else {
            console.log(`webhook server running on ${await this.localUrl}, ngrok has been disabled`);
        }
    }

    public setExpectedResponse(body: any, status?: number) {
        const _expectedResponse = {
            status: status || 200,
            body: body,
        };
        this.locals.expectedResponse = _expectedResponse;
    }

    public getExpectedResponse(): types.Locals['expectedResponse'] | undefined {
        return this.locals.expectedResponse;
    }

    public wait(timeout?: number) {
        const _timeout = timeout || this._webhookTimeout;
        const queue = this._queue;
        const emitter = this._emitter;
        return new Promise((resolve, reject) => {
            setTimeout(() => {
                reject(`timeout of ${_timeout} execeeded`)
            }, _timeout);
            if (!queue.isEmpty()) return resolve(queue.dequeue());
            emitter.on('webhook', (data) => {
                resolve(data);
            })
        })
    }
}
