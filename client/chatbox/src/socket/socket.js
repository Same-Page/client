const _socketEventHanders = {}

const _sendEvent = data => {
  window.parent.postMessage(
    {
      type: "sp-socket",
      data: data
      // eventName: eventName
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
  sendMessage: (roomId, msg) => {
    const payload = {
      action: "message",
      data: {
        roomId: roomId,
        content: msg
      }
    }
    _sendEvent(payload)
  },
  sendEvent: _sendEvent,
  // changeRoom: roomId => {
  //   window.parent.postMessage(
  //     { type: "sp-socket", roomId: roomId, action: "change room" },
  //     "*"
  //   )
  // },
  changeRoom: (roomId, mode) => {
    // alert("todo")
    // if (roomId && mode) {
    //   window.spDebug("change room to " + roomId)
    //   _sendEvent("change room", {
    //     roomId: roomId,
    //     mode: mode
    //   })
    // }
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
