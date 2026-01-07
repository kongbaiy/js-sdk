
interface StreamRequestParams {
    [key: string]: any
}

export class StreamRequest {
    private url: string
    private options: StreamRequestParams
    private messageCallback?: <T>(data: T) => void
    private errorCallback?: <T>(data: T) => void

    constructor(url: string, options?: any) {
        this.url = url
        this.options = options || {}
    }

    async send(params: StreamRequestParams) {
        const { url, options, messageCallback, errorCallback } = this

        try {
            const res = await fetch(url, {
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
                    if (message.trim()) messageCallback?.(JSON.parse(message || '{}'))
                })
            }
        } catch (error) {
            errorCallback?.(error)
        }
    }

    onMessage(callback: <T>(data: T) => void) {
        this.messageCallback = callback
    }

    onError(callback: <T>(data: T) => void) {
        this.errorCallback = callback
    }
}
