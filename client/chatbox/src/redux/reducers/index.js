const store = (state = {}, action) => {
  // console.log(action.type)
  // console.log(action.payload)
  switch (action.type) {
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
    case "SET_CHAT_MODES":
      return { ...state, chatModes: action.payload }
    case "VIEW_OTHER_USER":
      // TODO: compare user id with current user
      // if self then go to profile page
      return { ...state, otherUser: action.payload }
    case "JOIN_MAN_MADE_ROOM":
      return {
        ...state,
        tab: "chat",
        manMadeRoom: action.payload,
        chatView: "room"
      }
    default:
      return state
  }
}

export default store
