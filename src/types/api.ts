export type RequestOptions = {
    data?: Document | XMLHttpRequestBodyInit | null;
    headers?: {
        [key: string]: string;
    };
    async?: boolean
}

export type RequestType = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH' | 'OPTIONS' | 'HEAD' | 'TRACE' | 'CONNECT';

export type RequestHeader = {
    [key: string]: string;
}

export type RequestResponse = {
    data: any;
    code: number;
    message: string;
}
