const store = (state = { foo: 1 }, action) => {
  switch (action.type) {
    case "CHANGE_CHAT_VIEW":
      return { ...state, mode: action.payload }
    case "CHANGE_TAB":
      return { ...state, tab: action.payload }
    case "MESSAGE_OTHER_USER":
      return { ...state, tab: "inbox", inboxUser: action.payload }

    // case "ADD_LIVE_MSG":
    //   let newState = {}
    //   newState.liveMessages = []
    //   let msg = {
    //     username: "David",
    //     text: "hi"
    //   }
    //   newState.liveMessages.push(msg)
    //   console.log("reducing")
    //   console.log(newState)
    //   return newState
    // case "TOGGLE_TODO":
    //   return state.map(todo =>
    //     todo.id === action.id ? { ...todo, completed: !todo.completed } : todo
    //   )
    default:
      return state
  }
}

export default store
