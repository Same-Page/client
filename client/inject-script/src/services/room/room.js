const roomManager = {
  setUsersInRoom: users => {
    window.setUserCount(users.length)
  },
  addUserToRoom: user => {
    window.setUserCount(prevCount => {
      return prevCount + 1
    })
  },
  removeUserFromRoom: user => {
    window.setUserCount(prevCount => {
      return prevCount - 1
    })
  }
}
export default roomManager
