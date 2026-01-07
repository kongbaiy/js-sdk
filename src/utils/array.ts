
export function hasRepeatArray(arr: any[], keys?: string[]) {
    const map = new Map()

    for (const item of arr) {
        const val = keys?.map(key => item[key]).join(',') || item

        if (map.has(val)) return [true, val.split(',')]
        map.set(val, item)
    }

    return [false]
}