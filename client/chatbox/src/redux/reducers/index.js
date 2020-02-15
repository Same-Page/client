import axios from "axios"

import socketManager from "socket/socket"

import { getUrl, getDomain } from "utils/url"
import { msgOtherUser } from "../actions"

const initState = {
  chatModes: [],
  rooms: [],
  chatView: null,
  tab: null,
  inboxUser: null,
  otherUser: null
}
function getRooms(modes, manMadeRoom) {
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
  console.log(action.type)
  console.log(action.payload)
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

    case "VIEW_OTHER_USER":
      // TODO: compare user id with current user
      // if self then go to profile page
      return { ...state, otherUser: action.payload }
    case "JOIN_MAN_MADE_ROOM":
      const manMadeRoom = action.payload
      const rooms = state.rooms.filter(room => {
        return room.type !== "room"
      })
      rooms.push(manMadeRoom)

      const data = {
        rooms: rooms,
        token: state.account.token
      }
      socketManager.setRooms(data)
      socketManager.sendEvent({
        action: "room",
        data: {
          getChatHistory: true,
          rooms: [manMadeRoom.id]
        }
      })
      return {
        ...state,
        tab: "chat",
        rooms: rooms,
        manMadeRoom: manMadeRoom,
        chatView: "room"
      }
    default:
      return state
  }
}

export default store
