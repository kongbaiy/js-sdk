
interface StreamRequestConfig extends RequestInit {
    parseResponse?: boolean
}
interface StreamRequestParams {
    [key: string]: any
}

export class StreamRequest {
    private url: string
    private options: StreamRequestParams
    private beforeCallback?: (...args: any) => void
    private messageCallback?: <T>(data: T) => void
    private errorCallback?: <T>(data: T) => void
    private parseResponse?: boolean
    private beforeResponse?: (data: any, setResponse: <T>(data: T) => void) => void

    constructor(url: string, config?: StreamRequestConfig) {
        const { parseResponse, ...options } = config as StreamRequestConfig

        this.url = url
        this.options = options || {}
        this.parseResponse = parseResponse
    }

    private onBefore(callback: (...args: any) => void) {
        this.beforeCallback = callback
    }

    private async send(params: StreamRequestParams) {
        const { url, options, parseResponse } = this

        try {
            if (typeof this.beforeCallback === 'function') this.beforeCallback(params)
            
            const res = await window.fetch(url, {
                ...options,
                body: JSON.stringify(params),
            })
            const reader = res.body?.getReader()

            if (!reader) return

            while (true) {
                const { done, value } = await reader.read()

                if (done) break

                const data = new TextDecoder().decode(value)
                const newData = data.split('\n')

                if (typeof this.beforeResponse === 'function') {
                    this.beforeResponse(data, this.messageCallback!)
                } else {
                    newData.forEach((message: string) => {
                        if (message.trim()) {
                            this.messageCallback?.(parseResponse ? JSON.parse(message || '{}') : message)
                        }
                    })
                }
            }
        } catch (error) {
            this.errorCallback?.(error)
        }
    }

    onBeforeResponse(beforeResponse: () => void) {
        this.beforeResponse = beforeResponse
    }

    private onMessage(callback: <T>(data: T) => void) {
        this.messageCallback = callback
    }

    private onError(callback: <T>(data: T) => void) {
        this.errorCallback = callback
    }
}
