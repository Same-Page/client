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

export const setAccount = account => ({
  type: "SET_ACCOUNT",
  payload: account
})

export const setBlacklist = blacklist => ({
  type: "SET_BLACKLIST",
  payload: blacklist
})
