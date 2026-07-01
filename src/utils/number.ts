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

interface CountsUpCallbackOptions {
    value: number
    status: 'waiting' | 'running' | 'finished'
    interval?: ReturnType<typeof setInterval> | null
}

export const countsUp = (counts: number[][], callback: (current: CountsUpCallbackOptions[]) => void) => {
    const max = Math.max(...counts.flat());
    const resultCounts: CountsUpCallbackOptions[] = new Array(counts.length).fill({
        value: 0,
        status: 'waiting',
        interval: null
    });

    let current = 0;

    const run = () => {
        if (current >= max) {
            clearInterval(timer!)
            timer = null
        }

        for (let i = 0;i < counts.length; i++) {
            const [start, end] = counts[i]
            const buffers = [
                parseInt(16 / 100 * end  + ''),
                parseInt(6 / 100 * end  + '')
            ]
           
            if (current >= start && current <= end) {
                if (current >= end - buffers[0] && current < end - buffers[1]) {
                    if (!resultCounts[i].interval) {
                        resultCounts[i].interval = setInterval(() => {
                            resultCounts[i].value += 1;
                            callback(resultCounts)

                            if (resultCounts[i].value >= end - buffers[0]) {
                                clearInterval(resultCounts[i].interval!)
                                resultCounts[i].interval = null
                            }
                        }, 90)
                    }
                  
                } else if (current >= end - buffers[1]) {
                    if (!resultCounts[i].interval) {
                        resultCounts[i].interval = setInterval(() => {
                            resultCounts[i].value += 1;
                            callback(resultCounts)

                            if (resultCounts[i].value >= end) {
                                clearInterval(resultCounts[i].interval!)
                                resultCounts[i].interval = null
                            }
                        }, 200)
                    }
                } else {
                    resultCounts[i] = { value: current, status: current < end ? 'running' : 'finished' }
                }
            }
        }
        
       current ++;
       callback(resultCounts)
    }

    let timer: ReturnType<typeof setInterval> | null = setInterval(run, 16);
} 