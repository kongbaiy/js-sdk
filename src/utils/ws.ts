type WebSocketState = 'CONNECTING' | 'OPEN' | 'CLOSING' | 'CLOSED'

interface WebSocketConfig {
  heartbeat?: boolean
  heartbeatTime?: number
  reconnect: boolean
  reconnectTime?: number
  maxReconnectNumber?: number
}

const defaultWebSocketConfig: WebSocketConfig = {
  heartbeat: false,
  heartbeatTime: 15000,
  reconnect: false,
  reconnectTime: 1000,
  maxReconnectNumber: 3,
}

export function createWebSocket(url: string, config: WebSocketConfig | null, onOpen?: Function | null): WebSocket {
  config = { ...defaultWebSocketConfig, ...config }
  let open: Function | null = reconnectWebSocket()

  const init = (): WebSocket => {
    const ws = new WebSocket(url);

    ws.onopen = () => {
      if (config?.heartbeat) heartbeat(ws, config);

      onOpen?.()
    }

    ws.onerror = () => {
      if (config?.reconnect && open) {
        open(ws, config, init)
      }
      else {
        open = null
        config = null
      }
    }

    return ws
  }

  return init()
}

export function getState(ws: WebSocket, type: WebSocketState): boolean {
  return ws.readyState === WebSocket[type]
}

function reconnectWebSocket() {
  let reconnectTimeout: NodeJS.Timeout | null
  let reconnectNumber: number | null = 0

  const open = (ws: WebSocket, config: WebSocketConfig, callback: Function) => {
    const { reconnectTime, maxReconnectNumber = 1 } = config
    const isOpen = getState(ws, 'OPEN')

    if (isOpen || (reconnectTimeout && reconnectNumber! >= maxReconnectNumber)) {
      clearTimeout(reconnectTimeout as NodeJS.Timeout)
      reconnectTimeout = null
      reconnectNumber = null
      config.reconnect = false
      return
    }

    reconnectTimeout = setTimeout(() => {
      reconnectNumber! += 1
      callback()
    }, reconnectTime)
  }

  return open
}


function heartbeat(ws: WebSocket, config: WebSocketConfig) {
  const { heartbeatTime } = config
  let timer: NodeJS.Timeout | null = null

  timer = setInterval(() => {
    const isOpen = getState(ws, 'OPEN');
    const isConnected = getState(ws, 'CONNECTING');

    if (isOpen) {
      useSendMessage(ws, {
        type: 'heartbeat',
        timestamp: Date.now()
      });
    } else if (!isConnected) {
      const open = reconnectWebSocket();

      open(ws, config, () => {
        timer && clearInterval(timer);
        heartbeat(ws, config)
      });
    }
  }, heartbeatTime)
}

export function useSendMessage(ws: WebSocket, data: any) {
    const isOpen = getState(ws, 'OPEN')
    if (isOpen) ws.send(JSON.stringify(data))
}

export function useOnMessage(ws: WebSocket, callback: Function) {
  try {
    ws.onmessage = (e: MessageEvent<any>) => {
      const data = JSON.parse(e.data)

      callback(data, e)
    }
  } catch (error) {
    console.error(error)
  }
}

export function useClose(ws: WebSocket, code?: number, message?: string) {
  code = code || 1000
  message = message || 'connection closed by client'
  ws.close(code, message)
}