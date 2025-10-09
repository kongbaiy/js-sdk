import { READY_STATE } from '../enums/api';
import { RequestOptions, RequestType } from '../types/api';

export class Request {
    private readonly xhr: XMLHttpRequest;
    private beforeRequestOptions: RequestOptions = {};
    private beforeResponseCallback: undefined | ((...args: any) => void);
    
    constructor() {
        this.xhr = this.create();
    }

    create() {
        if (window.XMLHttpRequest) return new XMLHttpRequest();
        else if (window.ActiveXObject) return new ActiveXObject('Microsoft.XMLHTTP');
        throw new Error('您的浏览器暂不支持XMLHttpRequest');
    }

    useState(state: 'SUCCESS' | 'FAIL' | 'PENDING'): boolean {
        switch (state) {
            case 'SUCCESS':
                return this.xhr.readyState === READY_STATE.DONE && this.xhr.status >= 200 && this.xhr.status < 300;
            case 'FAIL':
                return this.xhr.readyState === READY_STATE.DONE && (this.xhr.status < 200 || this.xhr.status >= 300);
            case 'PENDING':
                return this.xhr.readyState < READY_STATE.DONE;
            default:
                return false;
        }
    }

    send(type: RequestType, url: string, options: RequestOptions = {}) {
        const { xhr, beforeRequestOptions, beforeResponseCallback } = this;
        const useState = this.useState.bind(this);
        const transformResponse = this.transformResponse.bind(this);

        return new Promise((resolve, reject) => {
            xhr.open(type, url, options.async || true);

            const requestOptions = {
                ...beforeRequestOptions,
                ...options
            };

            Object.keys(requestOptions.headers || {}).forEach(key => {
                xhr.setRequestHeader(key, requestOptions?.headers?.[key] as string);
            });

            xhr.onreadystatechange = function () {
                const success = useState('SUCCESS');
                const fail = useState('FAIL');

                if (success)  {
                    beforeResponseCallback 
                    ? beforeResponseCallback(transformResponse(xhr), resolve, reject) 
                    : resolve(transformResponse(xhr));
                } else if (fail) {
                    reject(transformResponse(xhr));
                }
            }

            xhr.onerror = function() {
                reject(transformResponse(xhr));
            }
            
            if (options.data instanceof FormData) {
                xhr.send(options.data);
            } else if (type === 'POST' || type === 'PUT') {
                xhr.send(JSON.stringify(options.data));
            } else {
                xhr.send();
            }
        });
    }

    transformResponse(response: XMLHttpRequest) {
        return {
            data: JSON.parse(response.responseText),
            code: response.status,
            message: response.statusText,
        }
    }

    transformQuery(url: string, query: any) {
        const queryData = Object.keys(query || {});
        
        if (!queryData.length) return url

        const queryString =queryData.map(key => 
            window.encodeURIComponent(key) + '=' + window.encodeURIComponent(query[key])
        ).join('&');

        url += (url.includes('?') ? '&' : '?') + queryString;

        return url;
    }

    beforeSend(callback: () => RequestOptions) {
       this.beforeRequestOptions = callback();
    }

    beforeResponse(callback: (...args: any) => void) {
        this.beforeResponseCallback =  callback;
    }

    abort() {
        this.xhr.abort();
    }

    get(url: string, query?: any, headers: RequestOptions['headers'] = {}) {
        const newUrl = this.transformQuery(url, query);
        return this.send('GET', newUrl, { headers });
    }

    post(url: string, data?: any, headers: RequestOptions['headers'] = {}) {
        return this.send('POST', url, { data, headers });
    }

    put(url: string, data?: any, headers: RequestOptions['headers'] = {}) {
        return this.send('PUT', url, { data, headers });
    }

    delete(url: string, data?: any, headers: RequestOptions['headers'] = {}) {
        return this.send('DELETE', url, { data, headers });
    }

    patch(url: string, data?: any, headers: RequestOptions['headers'] = {}) {
        return this.send('PATCH', url, { data, headers });
    }

    options(url: string, data?: any, headers: RequestOptions['headers'] = {}) {
        return this.send('OPTIONS', url, { data, headers });
    }
    
    head(url: string, data?: any, headers: RequestOptions['headers'] = {}) {
        return this.send('HEAD', url, { data, headers });
    }

    trace(url: string, data?: any, headers: RequestOptions['headers'] = {}) {
        return this.send('TRACE', url, { data, headers });
    }

    connect(url: string, data?: any, headers: RequestOptions['headers'] = {}) {
        return this.send('CONNECT', url, { data, headers });
    }
}

export class RequestChain {
    private fieldList: Record<string, any>[] = [{}];
    private responses: any[] = [];

    constructor(...args: Record<string, any>[]) {
        this.setParams(...args);
    }

    getParams(type: 'query' | 'body', data: any, fields: any) {
        const keys: string[] = Object.keys(fields);
        const values: string[] = Object.values(fields);

        if (type === 'query') {
            const query = keys.map((key, index) => {
                return `${key}=${data[values[index]]}`
            }).join('&');

            return query
        } else {
            const body: Record<string, any> = {};

            keys.forEach((key, index) => {
                body[key] = data[values[index]];
            });

            return body
        }
    }

    setParams(...args: Record<string, any>[]) {
        for (let i = 0;i < args.length; i++) {
            const arg = args[i];
            this.fieldList.push(arg);
        }
    }

    chain(list: any[]) {
        return list.reduce((pre, cur, index) => {
            return new Promise((resolve, reject) => {
                pre().then((preRes: any) => {
                    const fields = this.fieldList[index];
                    const type = fields?.query ? 'query' : 'body';
                    const params = this.getParams(type, preRes, fields?.query || fields);

                    this.responses.push(preRes);
                    cur(params).then((curRes: any) => {
                        this.responses.push(curRes);
                        resolve(this.responses)
                    });
                });
            });
        });
    }
}
