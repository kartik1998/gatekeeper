import http from 'http';
import https from 'https';
import URL from 'url';
import Base from './base';
import { createInterceptor } from '@mswjs/interceptors'
import { interceptClientRequest } from '@mswjs/interceptors/lib/interceptors/ClientRequest'
import * as utils from '../lib/utils';

export default class InterceptorModule extends Base {
    private webhookUrl: string;
    private webhooksCount: number = 1;
    private interceptor: any;

    constructor(webhookUrl: string) {
        super();
        this.webhookUrl = webhookUrl;
        this.interceptor = createInterceptor({
            resolver: () => { },
            modules: [interceptClientRequest],
        });
        this.interceptor.on("request", this._handleHttpRequest);
    }

    private _compareUrlAndOpts(url: string, options: any): boolean {
        return (URL.parse(url).protocol === options.protocol
            && URL.parse(url).hostname === options.hostname
            && URL.parse(url).port === options.port);
    }

    public waitForWebhook(): Promise<any> {
        throw new Error('Method not implemented.');
    }

    public setWebhooksCount(count: number): void {
        this.webhooksCount = count;
    }

    public getWebhooksCount(): number {
        return this.webhooksCount;
    }

    private _handleHttpRequest(request: any): void {
        const url = request.url.toString();
        const method = String(request.method);
        const headers = request.headers.raw();
        const requestEvent: any = {
            headers,
            method,
            url: request.url.toString(),
            body: request.body,
        };
        console.log(requestEvent);
    }
}