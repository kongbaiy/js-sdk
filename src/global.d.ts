export {};

declare global {
  interface Window {
    s: any;
    ActiveXObject: any
    webkitAudioContext: any
  }

  var ActiveXObject: {
    prototype: ActiveXObject;
      new (s: string): XMLHttpRequest;
  }
}
