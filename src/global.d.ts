export {}; // 确保是一个模块

declare global {
  interface Window {
    s: any; // 或指定类型，比如：string | number | SomeType
  }
}
