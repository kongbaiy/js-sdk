export {};

declare global {
  interface Window {
    s: any;
    ActiveXObject: any
  }

  var ActiveXObject: {
    prototype: ActiveXObject;
      new (s: string): XMLHttpRequest;
  }
}
