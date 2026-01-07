
interface StreamRequestConfig extends RequestInit {
    parseResponse?: boolean
}
interface StreamRequestParams {
    [key: string]: any
}

export class StreamRequest {
    private url: string
    private options: StreamRequestParams
    private messageCallback?: <T>(data: T) => void
    private errorCallback?: <T>(data: T) => void
    private parseResponse?: boolean

    constructor(url: string, config?: StreamRequestConfig) {
        const { parseResponse, ...options } = config as StreamRequestConfig

        this.url = url
        this.options = options || {}
        this.parseResponse = parseResponse
    }

    async send(params: StreamRequestParams) {
        const { url, options, parseResponse } = this

        try {
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

                newData.forEach((message: string) => {
                    if (message.trim()) {
                        this.messageCallback?.(parseResponse ? JSON.parse(message || '{}') : message)
                    }
                })
            }
        } catch (error) {
            this.errorCallback?.(error)
        }
    }

    onMessage(callback: <T>(data: T) => void) {
        this.messageCallback = callback
    }

    onError(callback: <T>(data: T) => void) {
        this.errorCallback = callback
    }
}
