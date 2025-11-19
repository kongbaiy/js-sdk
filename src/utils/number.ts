export const countUp = (start: number, end: number, callback: (current: number) => void) => {
    let current = start;
    const run = () => {
        if (current >= end) {
            clearInterval(timer);
        } else if (current >= end - 16 && current < end - 6) {
            clearInterval(timer);
            timer = setInterval(run, 90);
        }   else if (current >= end - 6) {
            clearInterval(timer);
            timer = setInterval(run, 200);
        } 

        callback(current++);
    }
    let timer = setInterval(run, 16);
}

// if (!Date.now){
//     Date.now = function () { 
//         return new Date().getTime(); 
//     };
// }

// (function () {
//     'use strict';
//     var vendors = ['webkit', 'moz'];
//     for (var i = 0; i < vendors.length && !window.requestAnimationFrame; ++i) {
//         var vp = vendors[i];
//         (window as any)[vp + 'RequestAnimationFrame'];
//         window.cancelAnimationFrame = (
//             (window as any)[vp + 'CancelAnimationFrame'] ||
//              (window as any)[vp + 'CancelRequestAnimationFrame']
//         )
//     }

//     if (
//         /iP(ad|hone|od).*OS 6/.test(window.navigator.userAgent) || 
//         !window.requestAnimationFrame || 
//         !window.cancelAnimationFrame
//     ) {
//         var lastTime = 0;
//         window.requestAnimationFrame = function (callback: FrameRequestCallback): any {
//             var now = Date.now();
//             var nextTime = Math.max(lastTime + 16, now);
//             return setTimeout( function () { 
//                 callback(lastTime = nextTime); 
//             },nextTime - now);

//         }

//         window.cancelAnimationFrame = clearTimeout;
//     }
// }())