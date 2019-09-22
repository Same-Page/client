const _socketEventHanders = {}

const _sendEvent = (eventName, data) => {
  window.parent.postMessage(
    {
      type: "sp-socket",
      data: data,
      eventName: eventName,
      action: "send event"
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
  sendMessage: msg => {
    window.parent.postMessage(
      { type: "sp-socket", msg: msg, action: "send message" },
      "*"
    )
  },
  sendEvent: _sendEvent,
  // changeRoom: roomId => {
  //   window.parent.postMessage(
  //     { type: "sp-socket", roomId: roomId, action: "change room" },
  //     "*"
  //   )
  // },
  changeRoom: (roomId, mode) => {
    if (roomId && mode) {
      console.log("change room to " + roomId)
      _sendEvent("change room", {
        roomId: roomId,
        mode: mode
      })
    }
  }
}

window.addEventListener(
  "message",
  e => {
    if (e && e.data && e.data.type === "sp-socket") {
      const eventName = e.data.name
      const data = e.data.data
      // console.debug(eventName)
      if (eventName in _socketEventHanders) {
        const handlers = _socketEventHanders[eventName] || {}
        Object.values(handlers).forEach(handler => {
          handler(data)
        })
      }
    }
  },
  false
)

export default socketManager
