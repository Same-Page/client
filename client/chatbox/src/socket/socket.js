// import Rooms from "../containers/Home/Rooms"
// import storageManager from "utils/storage"
import store from "redux/store"
import storageManager from "utils/storage"
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
const _leaveRoom = room => {
  const state = store.getState()
  if (state.account) {
    const token = state.account.token

    const payload = {
      action: "leave_single",
      data: {
        room: room,
        token: token
      }
    }
    _sendEvent(payload)
  }
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
  autoJoinRooms: rooms => {
    // only called once when chatbox open
    // join site, page and fixed rooms if not in the noJoin list
    const state = store.getState()
    if (state.account) {
      const token = state.account.token
      // noJoin should be in the state
      storageManager.get("noJoin", noJoin => {
        if (noJoin) {
          rooms = rooms.filter(r => {
            return !noJoin.includes(r.id)
          })
        }
        const payload = {
          action: "join",
          data: {
            rooms: rooms,
            token: token,
            getChatHistory: true
          }
        }

        _sendEvent(payload)
      })
    }
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
  leaveRoom: _leaveRoom,
  syncRooms: () => {
    // join action is actually a set room operation
    // will join rooms included and leave rooms not in
    window.spDebug("sync rooms")
    const state = store.getState()
    if (state.account) {
      const token = state.account.token
      const payload = {
        action: "join",
        data: {
          rooms: state.rooms.filter(r => {
            return r.connected
          }),
          token: token
        }
      }
      _sendEvent(payload)
    }
  },
  joinRoom: room => {
    const state = store.getState()

    if (room.type === "room" && state.manMadeRoom) {
      _leaveRoom(state.manMadeRoom)
    }

    if (state.account) {
      const token = state.account.token
      const payload = {
        action: "join_single",
        data: {
          room: room,
          token: token
        }
      }
      _sendEvent(payload)
    }
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

// socketManager.addHandler("room info", "popup", rooms => {
//   THis popup is handled by RoomHeader.js when setting room.connected
//   const state = store.getState()
//   const stateRooms = state.rooms
//   const roomTypes = []
//   Object.keys(rooms).forEach(roomId => {
//     const room = rooms[roomId]
//     if (room.chatHistory) {
//       roomTypes.push(intl.formatMessage({ id: room.type }))
//     }
//   })
//   if (roomTypes.length > 0) {
//     message.success(
//       roomTypes.join(", ") + " " + intl.formatMessage({ id: "connected" }),
//       2
//     )
//   }
// })
// socketManager.addHandler("disconnect", "popup", () => {
//   message.warn(intl.formatMessage({ id: "disconnected" }), 2)
// })
// socketManager.addHandler("alert", "popup", data => {
//   if (data.errorCode === 401) {
//     message.error(intl.formatMessage({ id: "not.login" }), 2)
//   } else if (data.errorCode === 402) {
//     message.error("积分不足", 2)
//   } else if (data.errorCode === 403) {
//     message.error("禁止通行", 2)
//   } else if (data.errorCode === 404) {
//     message.error(intl.formatMessage({ id: "not.found" }), 2)
//   } else if (data.errorCode === 409) {
//     message.error("权限不足", 2)
//   } else if (data.errorCode === 426) {
//     message.error("请升级该扩展", 2)
//   } else if (data.errorCode === 429) {
//     message.error(intl.formatMessage({ id: "slow.down" }), 2)
//   } else {
//     message.error(
//       intl.formatMessage({ id: "error" }) + ": " + data.errorCode,
//       3
//     )
//   }
// })

export default socketManager
