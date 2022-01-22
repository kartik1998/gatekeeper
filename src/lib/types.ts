export interface Locals {
    port: number | string;
    logWebHooksToConsole: boolean;
    expectedResponse: {
        status?: number;
        body?: any;
    };
    ngrokOpts: any;
    disableNgrok: boolean;
}

export interface Options {
    port?: number | string;
    logWebHooksToConsole?: boolean;
    expectedResponse?: {
        status?: number;
        body?: any;
    };
    ngrokOpts?: any;
    disableNgrok?: boolean;
    debug?: boolean;
}
