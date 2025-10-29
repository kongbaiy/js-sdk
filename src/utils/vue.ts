
import { ref, Ref } from 'vue'
import { download } from './download'

interface CountDown {
    countdownText: Ref<string>
    disabled: Ref<boolean>
    send: () => void
}
/**
 *
 * @param {number} num 倒计时时间
 * @param {string} text 按钮文本
 * @returns { object } countdownText 倒计时文本 isDisabled 是否禁用 send 发送验证码方法
 * @description 发送验证码倒计时
 */
export function useCountDown(num: number, text: string = '发送验证码'): CountDown {
    const countdownNum = ref(num)
    const countdownText = ref(text)
    const disabled = ref(false)

    const send = () => {
        countdownText.value = `${countdownNum.value}s`
        disabled.value = true

        const timer = setInterval(() => {
            countdownNum.value--
            countdownText.value = `${countdownNum.value}s`

            if (countdownNum.value === 0) {
                clearInterval(timer)
                countdownNum.value = num
                countdownText.value = text
                disabled.value = false
            }
        }, 1000)
    }
    return { countdownText, disabled, send }
}

export function useDownload() {
    const loading = ref<boolean>(false)
    const downloadFile = (url: string, filename?: string, success?: (blob: Blob) => void) => {
        const _filename = filename || 'download_' + new Date().getTime()
    
        loading.value = true
        download(url, _filename, (blob) => {
            loading.value = false
            success?.(blob)
        })
    }

    return {
        loading,
        downloadFile
    }
}