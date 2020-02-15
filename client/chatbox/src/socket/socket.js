const _socketEventHanders = {}

const _sendEvent = data => {
  window.parent.postMessage(
    {
      type: "sp-socket",
      data: data
    },
    "*"
  )
}
const socketManager = {
  addHandler: (eventName, callbackName, callback) => {
    const handlers = _socketEventHanders[eventName] || {}
    handlers[callbackName] = callback
    _socketEventHanders[eventName] = handlers
  },
  removeHandler: (eventName, callbackName) => {
    const handlers = _socketEventHanders[eventName]
    delete handlers[callbackName]
  },
  sendMessage: data => {
    const payload = {
      action: "message",
      data: data
    }
    // console.log(data)
    _sendEvent(payload)
  },
  sendEvent: _sendEvent,
  disconnect: () => {
    _sendEvent("disconnect socket")
  },
  setRooms: data => {
    const payload = {
      action: "join",
      data: data
    }
    _sendEvent(payload)
  }
}

window.addEventListener(
  "message",
  e => {
    if (e && e.data && e.data.type === "sp-socket") {
      window.spDebug(e.data)
      const data = e.data.data
      const eventName = data.name

      if (eventName in _socketEventHanders) {
        const handlers = _socketEventHanders[eventName] || {}
        Object.values(handlers).forEach(handler => {
          handler(data.data)
        })
      }
    }
  },
  false
)

export default socketManager
