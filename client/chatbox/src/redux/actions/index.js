export const changeTab = view => ({
  type: "CHANGE_TAB",
  payload: view
})

export const viewOtherUser = user => ({
  type: "VIEW_OTHER_USER",
  payload: user
})

export const msgOtherUser = user => ({
  type: "MESSAGE_OTHER_USER",
  payload: user
})
