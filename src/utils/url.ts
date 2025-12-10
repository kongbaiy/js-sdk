
type TAddURLParamsReturn = {
    url: string;
    queryString: string;
}

export function addURLParams(params: Record<string, any>, url?: string): TAddURLParamsReturn {
    url = url || window.location.href
    const urlParams = getURLParams(url)
    const queryString = new URLSearchParams(Object.entries({ ...urlParams, ...params })).toString()

    return {
        url: `${url}?${queryString}`,
        queryString,
    }
}

export function getURLParams(url?: string): Record<string, any> {
    url = url || window.location.href
    const urlString = url.split('?')[1]
    const urlSearchParams = new URLSearchParams(urlString)
    const result = Object.fromEntries(urlSearchParams.entries())

    return result
}


export function deleteURLParams(keys: string[], url?: string): URL {
    url = url || window.location.href
    const newUrl = new URL(url)
    const params = new URLSearchParams(newUrl.search)

    keys.forEach((key: string) => params.delete(key))
    newUrl.search = params.toString()

    return newUrl
}