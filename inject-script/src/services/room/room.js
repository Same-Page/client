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
const MSG_TIMEOUT = 7 * 1000
const _setUserMessage = (user, roomId, content) => {
	if (roomId === getDomain()) {
		// find user and clear timeout to delete message

		const usersInRoom = usersInRooms[roomId]
		let foundUser = false

		// const users = usersInRoom.filter(u => {
		// 	return u.id.toString() !== user.id.toString()
		// })
		// user.message = content.value || content.title || content.url
		// user.delMessageTimeout = setTimeout(() => {
		// 	_removeUserMessage(user, roomId)
		// }, MSG_TIMEOUT)
		// // move to front
		// users.unshift(user)
		const users = usersInRoom.map(u => {
			if (u.id.toString() === user.id.toString()) {
				foundUser = true
				if (u.delMessageTimeout) {
					clearTimeout(u.delMessageTimeout)
				}
				return {
					...u,
					message: content.value || content.title || content.url,
					delMessageTimeout: setTimeout(() => {
						_removeUserMessage(user, roomId)
					}, MSG_TIMEOUT)
				}
			}
			return u
		})

		if (!foundUser) {
			console.error(`user ${user.name} talking but not in room`)
		}

		usersInRooms[roomId] = users
		window.setUsers(users)
	}
}

const _removeUserMessage = (user, roomId) => {
	const usersInRoom = usersInRooms[roomId]

	const users = usersInRoom.map(u => {
		if (u.id.toString() === user.id.toString()) {
			delete u.delMessageTimeout
			delete u.message
			return {
				...u
			}
		}
		return u
	})

	usersInRooms[roomId] = users
	window.setUsers(users)
}
// TODO: no reason for these, move into state of Room.js
const roomManager = {
	clear: () => {
		Object.keys(usersInRooms).forEach(roomId => {
			usersInRooms[roomId] = []
		})
		window.setUsers([])
	},
	setUserMessage: _setUserMessage,
	setUsersInRoom: (roomId, users) => {
		// usersInRooms[roomId] = users
		// ^^ can't simply set users because will lose the message info
		const localUsersData = usersInRooms[roomId] || []
		const res = users.map(u => {
			const localUser = localUsersData.find(lu => {
				return lu.id.toString() === u.id.toString()
			})
			if (localUser) {
				return localUser
			}
			return u
		})
		// also preserve old order
		// let res = localUsersData.map(u => {
		// 	const user = users.find(lu => {
		// 		return lu.id.toString() === u.id.toString()
		// 	})
		// 	if (user) {
		// 		user.found = true
		// 		return u
		// 	}
		// 	return null
		// })
		// users.forEach(u => {
		// 	if (!u.found) {
		// 		res.push(u)
		// 	}
		// })
		// res = res.filter(u => {
		// 	return u
		// })
		usersInRooms[roomId] = res
		if (roomId === getDomain()) window.setUsers(res)
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
		usersInRooms[roomId].push({ ...user })

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
