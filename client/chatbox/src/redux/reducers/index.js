import socketManager from "socket/socket"
import { getUrl, getDomain } from "utils/url"

const initState = {
  chatModes: [],
  chatView: null,
  tab: null,
  inboxUser: null,
  otherUser: null
}

const store = (state = initState, action) => {
  // console.log(action.type)
  // console.log(action.payload)
  switch (action.type) {
    case "SET_CHAT_MODES":
      return { ...state, chatModes: action.payload }
    case "CHANGE_CHAT_VIEW":
      return { ...state, chatView: action.payload }
    case "CHANGE_TAB":
      return { ...state, tab: action.payload }
    case "MESSAGE_OTHER_USER":
      return {
        ...state,
        tab: "inbox",
        inboxUser: action.payload,
        otherUser: null
      }
    case "SET_ACCOUNT":
      return {
        ...state,
        account: action.payload
      }

    case "VIEW_OTHER_USER":
      // TODO: compare user id with current user
      // if self then go to profile page
      return { ...state, otherUser: action.payload }
    case "JOIN_MAN_MADE_ROOM":
      const manMadeRoom = action.payload
      const rooms = state.chatModes.map(mode => {
        let room = null
        if (mode === "page") {
          room = {
            type: "page",
            id: getUrl()
          }
        } else if (mode === "site") {
          room = {
            type: "site",
            id: getDomain()
          }
        } else {
          room = {
            type: "man-made",
            id: manMadeRoom.id
          }
        }
        return room
      })
      const data = {
        rooms: rooms,
        token: state.account.token
      }
      socketManager.setRooms(data)
      return {
        ...state,
        tab: "chat",
        manMadeRoom: manMadeRoom,
        chatView: "room"
      }
    default:
      return state
  }
}

export default store
