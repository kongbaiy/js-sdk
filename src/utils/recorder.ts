export interface AudioRecorderOptions {
    media: MediaStreamConstraints
    mediaRecorder?: MediaRecorderOptions
    maxTime?: number
}

interface TimerOptions {
    next?: () => void
    end?: () => void
}

export interface AudioInfo {
    sampleRate: number
    channels: number
    format: string | null
    bitDepth: number
}

export class AudioRecorder {
    private options: AudioRecorderOptions  = {
        media: {
            audio: {
                channelCount: { ideal: 2 },
                sampleRate: { ideal: 44100 },
                echoCancellation: true,
            }
        },
        mediaRecorder: {
            mimeType: 'audio/mp4;codecs=mp4a.40.2',
        },
        maxTime: 0,
    }
    private stream: MediaStream | null = null;
    private mediaRecorder: MediaRecorder | null = null;
    private audioChunks: Blob[] = [];
    private audioInfo: Partial<AudioInfo> = {
        sampleRate: 0,
        channels: 0,
        format: null,
        bitDepth: 0,
    }

    private timer: NodeJS.Timeout | null = null;
    private timerCount: number = 0;

    private stopCallback: ((audioChunks: Blob[]) => void) | null = null;
    private timerCallback: ((count: number) => void) | null = null;
    private timerEndCallback: (() => void) | null = null;

    constructor(options: AudioRecorderOptions) {
        this.audioChunks = [];
        this.options = options;
    }

    //  开始录音
    async start() {
        try {
            const { media, mediaRecorder, maxTime = 0 } = this.options

            this.stream = await navigator.mediaDevices.getUserMedia({ audio: media.audio })
            this.mediaRecorder = new MediaRecorder(this.stream, mediaRecorder);
            this.mediaRecorder.ondataavailable = (event) => {
                this.audioInfo.format = event.data.type;
                this.audioChunks.push(event.data);
            }
            this.mediaRecorder.onstop = () => {
                this.stopCallback?.(this.audioChunks);
                this.reset()
            }
            this.mediaRecorder.start();

            if (maxTime > 0) {
                this.startTimer({
                    end: () => {
                        this.stop();
                    }
                })
            }
        } catch (error) {
            throw new Error(error as string)
        }
    }

    //  停止录音
    stop() {
        if (this.mediaRecorder) {
            this.reset()
            this.timerEndCallback?.();
            this.mediaRecorder.stop();
        }
    }

    reset() {
        this.clearTimer();
        this.audioChunks = [];
        this.stream?.getTracks()?.forEach(track => track.stop())
    }

    onStop(callback: (audioChunks: Blob[]) => void) {
        this.stopCallback = callback;
    }

    startTimer(options?: TimerOptions) {
        const { next, end } = options || {};
        
        this.timer = setInterval(() => {
            next?.();
            this.timerCallback?.(this.timerCount);

            if (this.timerCount === this.options.maxTime) {
                this.clearTimer();
                end?.();
                this.timerEndCallback?.();
            }

            this.timerCount++;
        }, 1000)
    }

    //  清除定时器
    clearTimer() {
        if (this.timer) clearInterval(this.timer);
        this.timer = null;
        this.timerCount = 0;
    }

    onTimer(callback: (count: number) => void) {
        this.timerCallback = callback;
    }

    onTimerEnd(callback: () => void) {
        this.timerEndCallback = callback;
    }

    getAudioBlob(): Blob | null {
        if (!this.mediaRecorder) return null

        const type = this.getExtension(this.mediaRecorder.mimeType as string)
        return new Blob(this.audioChunks, { type: `audio/${type}` })
    }

    getAudioUrl(): string {
        const blob = this.getAudioBlob();

        if (!blob) return ''
        return URL.createObjectURL(blob);
    }

    getAudioBase64(blob: Blob): Promise<string> {
         return new Promise<string>((resolve, reject) => {
            const reader = new FileReader()
            
            reader.onerror = reject
            reader.onload = () => resolve(reader.result as string)
            reader.readAsDataURL(blob)
        })
    }

    getAudioInfo() {
        return new Promise(async (resolve, reject) => {
            try {
                const audioContext = new (window.AudioContext || window.webkitAudioContext)();
                const source = audioContext.createMediaStreamSource(this.stream as MediaStream); 
                const analyser = audioContext.createAnalyser();
                source.connect(analyser);

                const sampleRate = audioContext.sampleRate;
                const channels = this.stream?.getAudioTracks()[0].getSettings().channelCount || 0;
                // const { bitsPerSample } = await this.getWavBitDepth(this.getAudioBlob() as Blob);

                resolve({
                    ...this.audioInfo,
                    sampleRate,
                    channels,
                    // bitDepth: metadata.format.bitsPerSample,
                })
            } catch (error) {
                reject(error)
            }
        })
      
    }

//    getWavBitDepth(blob: Blob): Promise<number> {
//         return new Promise<number>((resolve, reject) => {
//             const reader = new FileReader();

//             reader.onload =  (event) => {
//                 const arrayBuffer = event.target?.result as ArrayBuffer;

//                 if (!arrayBuffer) {
//                     reject();
//                     throw new Error('未能读取 Blob 数据');
//                 }

//                 const data = new DataView(arrayBuffer);
//                 console.log('data: ', data);
//                 // 检查 "fmt " 区域，WAV文件的音频格式信息通常在此
//                 const fmtChunkOffset = 20; // "fmt " chunk 在 WAV 文件头的位置
//                 const bitDepth = data.getUint16(fmtChunkOffset + 14, true); // 16位表示小端存储

//                 resolve(bitDepth)
//             }
//             reader.readAsArrayBuffer(blob);
//         })
//     }

    getWavBitDepth(blob: Blob): Promise<number> {
        return new Promise<any>((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = (event) => {
                try {
                    const arrayBuffer = event.target?.result as ArrayBuffer;

                if (!arrayBuffer) {
                    reject('未能读取 Blob 数据');
                }

                const data = new DataView(arrayBuffer);

                // 确保文件足够大
                if (data.byteLength < 44) {
                    console.error('文件太小，无法解析 WAV 头部');
                    return;
                }

                // 检查 "RIFF" 标志
                const riff = String.fromCharCode(data.getUint8(0), data.getUint8(1), data.getUint8(2), data.getUint8(3));
                if (riff !== 'RIFF') {
                    console.error('无效的 WAV 文件');
                    return;
                }

                // 获取 WAVE 标志
                const wave = String.fromCharCode(data.getUint8(8), data.getUint8(9), data.getUint8(10), data.getUint8(11));
                if (wave !== 'WAVE') {
                    console.error('无效的 WAV 文件');
                    return;
                }

                // 获取 fmt 标志
                const fmt = String.fromCharCode(data.getUint8(12), data.getUint8(13), data.getUint8(14), data.getUint8(15));
                if (fmt !== 'fmt ') {
                    console.error('无效的 fmt 区块');
                    return;
                }

                // 获取音频格式、声道数、采样率等
                const format = data.getUint16(20, true);  // 音频格式（1: PCM）
                const numChannels = data.getUint16(22, true);  // 声道数
                const sampleRate = data.getUint32(24, true);  // 采样率
                const byteRate = data.getUint32(28, true);  // 字节率
                const blockAlign = data.getUint16(32, true);  // 数据块对齐大小
                const bitsPerSample = data.getUint16(34, true);  // 位深度

                console.log('音频格式:', format === 1 ? 'PCM' : '其他格式');
                console.log('声道数:', numChannels);
                console.log('采样率:', sampleRate);
                console.log('字节率:', byteRate);
                console.log('数据块对齐大小:', blockAlign);
                console.log('位深度:', bitsPerSample);  // 位深度在这里

                resolve({
                    format,
                    numChannels,
                    sampleRate,
                    byteRate,
                    blockAlign,
                    bitsPerSample,
                })

                // 如果格式是 PCM 格式，则位深度应该在 16 或 24 位之间
                } catch (error) {
                    reject(error)
                }
            } 
            reader.readAsArrayBuffer(blob);
        })
    }

    download(blob: Blob) {
        if (!blob) return null

        const format = this.getExtension(this.mediaRecorder?.mimeType as string)
        const fileName = `recording_${Date.now() + Math.random().toString(36).substring(2)}.${format}`
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');

        a.style.display = 'none';
        a.href = url;
        a.download = fileName;

        a.click();
        URL.revokeObjectURL(url);
    }

    getExtension(mimeType: string): string {
        const mimeToExt: Record<string, string> = {
            'audio/webm': 'webm',
            'audio/webm;codecs=opus': 'webm',
            'audio/ogg': 'ogg',
            'audio/ogg;codecs=opus': 'ogg',
            'audio/mp4': 'mp4',
            'audio/mpeg': 'mp3',
            'audio/wav': 'wav',
        }

        if (mimeToExt[mimeType]) return mimeToExt[mimeType]
        const mainType = mimeType.split(';')[0]

        return mimeToExt[mainType] || 'audio'
    }

    //  上传音频到服务器
    async upload(url: string, options?: RequestInit) {
        const audioBlob = this.getAudioBlob();

        if (!audioBlob) return null

        const formData = new FormData();
        const format = this.getExtension(this.mediaRecorder?.mimeType as string)
        const fileName = `recording_${Date.now() + Math.random().toString(36).substring(2)}.${format}`

        formData.append('audio', audioBlob, fileName);
        
        try {
            const response = await fetch(url, options);
            const data = await response.json();

            return data
        } catch (error) {
            throw new Error(error as string)
        }
    }
}
