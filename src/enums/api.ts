export enum READY_STATE {
    // 未初始化
    UNSENT = 0,
    // 已打开
    OPENED = 1,
    // 已获取响应头
    HEADERS_RECEIVED = 2,
    // 已加载响应体
    LOADING = 3,
    // 已完成
    DONE = 4,
}

export enum STATUS_CODE {
    // 2xx 成功
    OK = 200,
    CREATED = 201,
    ACCEPTED = 202,
    NO_CONTENT = 204,

    // 3xx 重定向
    MOVED_PERMANENTLY = 301,
    FOUND = 302,
    NOT_MODIFIED = 304,

    // 4xx 客户端错误
    BAD_REQUEST = 400,
    UNAUTHORIZED = 401,
    FORBIDDEN = 403,
    NOT_FOUND = 404,

    // 5xx 服务器错误
    INTERNAL_SERVER_ERROR = 500,
    SERVICE_UNAVAILABLE = 503,
    GATEWAY_TIMEOUT = 504,
}

export enum HTTP_STATUS_MESSAGE {
    // 2xx 成功
    OK = '请求成功',
    CREATED = '创建成功',
    ACCEPTED = '已接收',
    NO_CONTENT = '无内容',

    // 3xx 重定向
    MOVED_PERMANENTLY = '已永久移动',
    FOUND = '已找到',
    NOT_MODIFIED = '未修改',

    // 4xx 客户端错误
    BAD_REQUEST = '请求错误',
    UNAUTHORIZED = '未授权',
    FORBIDDEN = '禁止访问',
    NOT_FOUND = '未找到',

    // 5xx 服务器错误
    INTERNAL_SERVER_ERROR = '服务器错误',
    SERVICE_UNAVAILABLE = '服务不可用',
    GATEWAY_TIMEOUT = '网关超时',
}

export enum HTTP_METHOD {
    GET = 'GET',
    POST = 'POST',
    PUT = 'PUT',
    DELETE = 'DELETE',
}

export enum HTTP_HEADER {
    CONTENT_TYPE = 'Content-Type',
    ACCEPT = 'Accept',
    AUTHORIZATION = 'Authorization',
}

export enum HTTP_CONTENT_TYPE {
    JSON = 'application/json',
    FORM_URLENCODED = 'application/x-www-form-urlencoded',
    MULTIPART_FORM_DATA = 'multipart/form-data',
}

export enum HTTP_STATUS {
    OK = 200,
    CREATED = 201,
    ACCEPTED = 202,
    NO_CONTENT = 204,
}

