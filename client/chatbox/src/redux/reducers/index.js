import axios from "axios"

// import socketManager from "socket/socket"
import storageManager from "utils/storage"
import { getUrl, getDomain } from "utils/url"

const initState = {
  chatModes: [],
  rooms: [],
  chatView: null,
  tab: null,
  inboxUser: null,
  otherUser: null
}
function getRooms(modes, manMadeRoom) {
  // return room regardless connected or not
  let rooms = modes.map(mode => {
    if (mode === "page") {
      return {
        type: mode,
        id: getUrl()
      }
    } else if (mode === "site") {
      return {
        type: mode,
        id: getDomain()
      }
    } else {
      return manMadeRoom
    }
  })

  rooms = rooms.filter(r => {
    return r
  })
  return rooms
}
const store = (state = initState, action) => {
  const rooms = [...state.rooms]
  // console.log(action.type)
  // console.log(action.payload)
  switch (action.type) {
    case "SET_CHAT_MODES":
      const modes = action.payload
      return {
        ...state,
        chatModes: modes,
        rooms: getRooms(modes, state.manMadeRoom)
      }
    case "CHANGE_CHAT_VIEW":
      return { ...state, chatView: action.payload }
    case "CHANGE_TAB":
      return { ...state, tab: action.payload }
    case "MESSAGE_OTHER_USER":
      let tab = state.tab
      if (action.payload) {
        tab = "inbox"
      }
      return {
        ...state,
        tab: tab,
        inboxUser: action.payload,
        otherUser: null
      }
    case "SET_ACCOUNT":
      const account = action.payload
      if (account) {
        axios.defaults.headers.common["token"] = account.token
      } else {
        // socketManager.disconnect()  no need, injection script listen on account change too
      }

      return {
        ...state,
        account: account
      }
    case "SET_ROOM_STATUS":
      // console.log("SET_ROOM_STATUS")
      // console.log(action.payload.roomId)
      // console.log(action.payload.connected)
      rooms.forEach(r => {
        if (r.id === action.payload.roomId) {
          r.connected = action.payload.connected
        }
      })
      return { ...state, rooms: rooms }
    case "VIEW_OTHER_USER":
      // TODO: compare user id with current user
      // if self then go to profile page
      return { ...state, otherUser: action.payload }
    case "JOIN_MAN_MADE_ROOM":
      const manMadeRoom = action.payload
      let roomsCopy = rooms
      if (!state.manMadeRoom || state.manMadeRoom.id !== manMadeRoom.id) {
        roomsCopy = rooms.filter(room => {
          return room.type !== "room"
        })
        roomsCopy.push(manMadeRoom)
        // do not save connected status
        delete manMadeRoom["connected"]
        storageManager.set("room", manMadeRoom)
      }

      return {
        ...state,
        tab: "chat",
        rooms: roomsCopy,
        manMadeRoom: manMadeRoom,
        chatView: "room"
      }
    default:
      return state
  }
}

export default store
