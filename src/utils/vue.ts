
import { ref, Ref } from 'vue'

interface CountDown {
    countdownText: Ref<string>
    isDisabled: Ref<boolean>
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
    const isDisabled = ref(false)

    const send = () => {
        countdownText.value = `${countdownNum.value}s`
        isDisabled.value = true

        const timer = setInterval(() => {
            countdownNum.value--
            countdownText.value = `${countdownNum.value}s`

            if (countdownNum.value === 0) {
                clearInterval(timer)
                countdownNum.value = num
                countdownText.value = text
                isDisabled.value = false
            }
        }, 1000)
    }
    return { countdownText, isDisabled, send }
}
