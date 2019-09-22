let liveMsgId = 0

export const addLiveMsg = text => ({
  type: 'ADD_LIVE_MSG',
  id: liveMsgId++,
  text
})