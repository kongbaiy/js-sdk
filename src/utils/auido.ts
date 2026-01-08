
interface AudioRecorderOptions {
    channelCount: number;
    sampleRate: number;
    echoCancellation: boolean;
    mimeType: string;
}

class AudioRecorder {
    private options: AudioRecorderOptions = {
        channelCount: 1,
        sampleRate: 44100,
        echoCancellation: true,
        mimeType: 'audio/wav',
    };
    private stream: MediaStream | null = null;
    private mediaRecorder: MediaRecorder | null = null;
    private audioChunks: Blob[] = [];

    constructor(options: AudioRecorderOptions) {
        this.audioChunks = [];
        this.options = options;
    }

    //  开始录音
    async start() {
        try {
            this.stream = await navigator.mediaDevices.getUserMedia({ audio: this.options })
            this.mediaRecorder = new MediaRecorder(this.stream);
            this.mediaRecorder.ondataavailable = (event) => {
                this.audioChunks.push(event.data);
            };
            this.mediaRecorder.start();
        } catch (error) {
            console.log(error)
        }
    }

    //  停止录音
    stop() {
        if (this.mediaRecorder) this.mediaRecorder.stop();
    }

    reset() {
        this.audioChunks = [];
    }

    getAudioBlob() {
        return new Blob(this.audioChunks, { type: 'audio/wav' });
    }

    getAudioUrl() {
        return URL.createObjectURL(this.getAudioBlob());
    }

    getAudioBase64() {
        return this.getAudioUrl().replace('data:audio/wav;base64,', '');
    }

    //  上传音频到服务器
    async uploadAudio() {
        const audioBlob = this.getAudioBlob();
        const formData = new FormData();
        formData.append('audio', audioBlob, 'recording.wav');
        try {
            const response = await fetch('/upload-audio', {
                method: 'POST',
                body: formData
            });
            if (response.ok) {
                console.log('音频上传成功');
            } else {
                console.log('音频上传失败');
            }
        } catch (error) {
            console.log(error)
        }
    }
}