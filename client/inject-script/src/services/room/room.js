import { getDomain } from "utils/url"
// this file deprecated and replaced by Room.js
const usersInRooms = {}
// const getCountArray = () => {
// 	const res = []
// 	Object.keys(usersInRooms).forEach(roomId => {
// 		const room = usersInRooms[roomId]
// 		res.push(room.length)
// 	})
// 	return res
// }

const roomManager = {
	clear: () => {
		Object.keys(usersInRooms).forEach(roomId => {
			usersInRooms[roomId] = []
		})
		window.setUsers([])
	},
	setUsersInRoom: (roomId, users) => {
		usersInRooms[roomId] = users
		if (roomId === getDomain()) window.setUsers([...users])
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

		if (roomId === getDomain()) window.setUsers([...usersInRooms[roomId]])
	},
	removeUserFromRoom: (roomId, user) => {
		if (!(roomId in usersInRooms)) {
			usersInRooms[roomId] = []
		}
		usersInRooms[roomId] = usersInRooms[roomId].filter(u => {
			return u.id !== user.id
		})
		if (roomId === getDomain()) window.setUsers([...usersInRooms[roomId]])
	}
}
export default roomManager
