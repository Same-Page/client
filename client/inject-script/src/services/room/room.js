import { getDomain, getUrl } from "utils/url"

const usersInRooms = {}
const getCountArray = () => {
	const res = []
	Object.keys(usersInRooms).forEach(roomId => {
		const room = usersInRooms[roomId]
		res.push(room.length)
	})
	return res
}

const roomManager = {
	clear: () => {
		Object.keys(usersInRooms).forEach(roomId => {
			usersInRooms[roomId] = []
		})
		window.setUserCount(0)
	},
	setUsersInRoom: (roomId, users) => {
		usersInRooms[roomId] = users
		if (roomId === getDomain()) window.setUserCount(users.length)
	},
	addUserToRoom: (roomId, user) => {
		if (!(roomId in usersInRooms)) {
			usersInRooms[roomId] = []
		}
		const usersInRoom = usersInRooms[roomId]
		// avoid dup because in some case we receive this event multiple times
		usersInRooms[roomId] = usersInRoom.filter(u => {
			return u.id !== user.id
		})
		usersInRooms[roomId].push(user)

		if (roomId === getDomain())
			window.setUserCount(usersInRooms[roomId].length)
	},
	removeUserFromRoom: (roomId, user) => {
		if (!(roomId in usersInRooms)) {
			usersInRooms[roomId] = []
		}
		usersInRooms[roomId] = usersInRooms[roomId].filter(u => {
			return u.id !== user.id
		})
		if (roomId === getDomain())
			window.setUserCount(usersInRooms[roomId].length)
	}
}
export default roomManager
