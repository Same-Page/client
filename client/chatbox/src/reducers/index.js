const todos = (state = {}, action) => {
  switch (action.type) {
    case "ADD_LIVE_MSG":
      let newState = {}
      newState.liveMessages = []
      let msg = {
        username: "David",
        text: "hi"
      }
      newState.liveMessages.push(msg)
      console.log("reducing")
      console.log(newState)
      return newState
    case "TOGGLE_TODO":
      return state.map(todo =>
        todo.id === action.id ? { ...todo, completed: !todo.completed } : todo
      )
    default:
      return state
  }
}

export default todos
