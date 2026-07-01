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
    buffers?: number[]
    startBufferCount?: (buffer: number, delay: number) => void
}

const getBufferValue = (value: number, buffer: number) => {
    if (value / buffer > 2) return value - buffer
    return 0
}

export const countsUp = (counts: number[][], callback: (current: CountsUpCallbackOptions[]) => void) => {
    const countsFlat = counts.flat();
    const max = Math.max(...countsFlat);
    const resultCounts: CountsUpCallbackOptions[] = counts.map((range) => ({
        value: range[0],
        status: 'waiting',
        interval: null as CountsUpCallbackOptions['interval'],
        buffers: [
            getBufferValue(range[1], 16),
            getBufferValue(range[1], 6)
        ],
        startBufferCount(buffer: number, delay: number = 0) {
            if (!this.interval) {
                this.interval = setInterval(() => {
                    this.value += 1;

                    if (this.value >= range[1] - buffer || this.value >= range[1]) {
                        clearInterval(this.interval!);
                        this.interval = null;
                    }

                    callback(resultCounts);
              }, delay);
            }
        }
    }))

    let current = 0;
    let stop = false;
    const run = () => {
        if (current >= max || stop) {
            clearInterval(timer!);
            timer = null;
        }
        
        for (let i = 0;i < counts.length; i++) {
            const [start, end] = counts[i]
            const buffers = resultCounts[i].buffers || [];
            const value = current + start;

            // If the current value exceeds the maximum and it's the last count, we stop the counting process.
            if (value >= max && i === counts.length - 1) stop = true;

            // If the current value exceeds the end value, we skip the current iteration and move to the next count.
            if (value >= end) continue;

            if (value >= buffers[0] && value < buffers[1]) {
              // If the current value is within the buffer range, we start the buffer counting process.
              resultCounts[i].startBufferCount?.(buffers[0], 90);
            } else if (value >= buffers[1]) {
              // If the current value exceeds the second buffer, we start the buffer counting process with a longer delay.
              resultCounts[i].startBufferCount?.(0, 200);
            } else {
              // If the current value is below the first buffer, we update the value and status directly.
              resultCounts[i].value = value;
              resultCounts[i].status = value < end ? "running" : "finished";
            }
        }
        
       current ++;
       callback(resultCounts);
    }

    let timer: ReturnType<typeof setInterval> | null = setInterval(run, 16);
} 