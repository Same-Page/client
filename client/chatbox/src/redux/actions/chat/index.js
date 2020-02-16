export const changeChatView = view => ({
  type: "CHANGE_CHAT_VIEW",
  payload: view
})
export const setChatModes = modes => ({
  type: "SET_CHAT_MODES",
  payload: modes
})
export const joinManMadeRoom = room => ({
  type: "JOIN_MAN_MADE_ROOM",
  payload: room
})
export const setRoomConnectionStatus = (roomId, connected) => ({
  type: "SET_ROOM_STATUS",
  payload: {
    roomId: roomId,
    connected: connected
  }
})
