const usersInRooms = {}

const roomManager = {
	setUsersInRoom: (roomId, users) => {
		usersInRooms[roomId] = users
		window.setUserCount(users.length)
	},
	addUserToRoom: (roomId, user) => {
		if (!(roomId in usersInRooms)) {
			usersInRooms[roomId] = []
		}
		const usersInRoom = usersInRooms[roomId]
		usersInRoom.push(user)
		window.setUserCount(usersInRoom.length)
	},
	removeUserFromRoom: (roomId, user) => {
		alert("todo")
		// window.setUserCount(usersInRoom.length)
	}
}
export default roomManager
