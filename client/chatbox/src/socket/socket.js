// import Rooms from "../containers/Home/Rooms"
// import storageManager from "utils/storage"

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
  getRoomInfo: roomIds => {
    roomIds = roomIds || []
    _sendEvent({
      action: "room",
      data: {
        getChatHistory: true,
        rooms: roomIds // when receive empty list, backend will return all rooms connected
      }
    })
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
  leaveRoom: (roomId, rooms, token) => {
    const filteredRooms = rooms.filter(r => {
      return r.connected && r.id !== roomId
    })
    const payload = {
      action: "join",
      data: {
        rooms: filteredRooms,
        token: token
      }
    }
    _sendEvent(payload)
  },
  joinRoom: (roomId, rooms, token) => {
    const filteredRooms = rooms.filter(r => {
      return r.connected || r.id === roomId
    })
    const payload = {
      action: "join",
      data: {
        rooms: filteredRooms,
        token: token
      }
    }
    _sendEvent(payload)
    // storageManager.get("noJoin", noJoin => {
    //   noJoin = noJoin || []
    //   const filteredRooms = rooms.filter(r => {
    //     return !noJoin.includes(r.id) || r.id === roomId
    //   })
    //   const payload = {
    //     action: "join",
    //     data: {
    //       rooms: filteredRooms,
    //       token: token
    //     }
    //   }
    //   _sendEvent(payload)
    // })
  }
  // setRooms: (rooms, token, latestNoJoin) => {
  //   // noJoin is passed in sometimes to avoid race condition
  //   // filter out rooms that user don't want to join
  //   storageManager.get("noJoin", noJoin => {
  //     noJoin = latestNoJoin || noJoin || []
  //     const filteredRooms = rooms.filter(r => {
  //       return !noJoin.includes(r.id)
  //     })
  //     const payload = {
  //       action: "join",
  //       data: {
  //         rooms: filteredRooms,
  //         token: token
  //       }
  //     }
  //     _sendEvent(payload)
  //   })
  // }
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
