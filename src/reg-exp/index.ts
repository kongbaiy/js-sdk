/**
 * 匹配中文字母数字
 */
export const zhLetterNumber: RegExp = /^[\u4E00-\u9FA5\w]+$/

/**
 * 匹配 IP
 */
export const ip: RegExp = /^(?:(?:25[0-5]|2[0-4]\d|[01]?\d{1,2})\.){3}(?:25[0-5]|2[0-4]\d|[01]?\d{1,2})$/

/**
 * 匹配手机号
 */
export const phone: RegExp = /^1[3-9]\d{9}$/

/**
 * 匹配身份证号
 */ 
export const idCard: RegExp = /^\d{17}[\dXx]|\d{15}$/

/**
 * 匹配邮箱
 */ 
export const email: RegExp = /^[a-zA-Z0-9_.-]+@[a-zA-Z0-9-]+(\.[a-zA-Z0-9-]+)*\.[a-zA-Z0-9]{2,6}$/

/**
 * 匹配 URL
 */ 
export const url: RegExp = /^https?:\/\/[^\s/$.?#].[^\s]*$/
