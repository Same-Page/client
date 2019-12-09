const tagManager = require("./tag.js")

const SIMILARITY_THRESHOLD = 0.6
const LOBBY_ROOM_ID = "5"
const MIN_USER_IN_ROOM = 3

let roomIdCount = 0
const roomDict = {} // key: roomId, value: dict of sockets
// roomDict = {
//   roomId: {
//     id: roomId,
//     users: {
//        userId: {
//          user: {},
//          sockets: set of socket ids
//        }
//     },
//     messages: [],
//     tags: ['Nike', 'shoes', 'discount']
//   }
// }
const roomManager = {
	getRoom: roomId => {
		return roomDict[roomId]
	},
	getRoomInfo: (roomId, userPageTags) => {
		// return basic info for client to use
		// Because room tags come from the first user
		// be careful not to expose user's private info
		// If client send their userPageTags, only return
		// the matched ones
		// If it's from the popular room endpoint, return
		// limited tags (TODO: remove uncommon tags for pop rooms)

		if (roomId in roomDict) {
			const room = roomDict[roomId]
			let roomTags = room.tags
			if (userPageTags) {
				roomTags = userPageTags.filter(tag => {
					return roomTags.includes(tag)
				})
			} else {
				roomTags.splice(3)
				// TODO: remove uncommon tags for pop rooms
			}
			return {
				id: room.id,
				tags: roomTags,
				about: roomTags.join(", "),
				userCount: Object.keys(room.users).length
			}
		}
		return null
	},
	getPopularRooms: () => {
		// might be too slow to sort all rooms
		// so we filter to find room with at least x users first
		const rooms = Object.values(roomDict).filter(room => {
			return Object.keys(room.users).length >= MIN_USER_IN_ROOM
		})
		rooms.sort((a, b) => {
			return Object.keys(b.users).length - Object.keys(a.users).length
		})
		return rooms.map(room => {
			return roomManager.getRoomInfo(room.id)
		})
	},
	addMsgToRoomHistory: (message, roomId) => {
		// Save message to room object, only keep latest ten
		const room = roomDict[roomId]
		room.messages.push(message)
		if (room.messages.length > 50) {
			room.messages.shift()
		}
	},
	removeSocketFromRoom: socket => {
		// If a user is leaving room entirely (all his sockets gone),
		// return that user
		let removingUser = false

		const userId = socket.user.id
		const roomId = socket.roomId
		const room = roomDict[roomId]
		const userWithSockets = room.users[userId]
		const sockets = userWithSockets.sockets
		sockets.delete(socket.id)

		// after deleting the socket, check if need to also
		// delete user from room, or even delete the room
		if (sockets.size === 0) {
			// delete user
			delete room.users[userId]
			removingUser = true
		}

		if (Object.keys(room.users).length === 0) {
			// Must delete room or memory leak super fast
			// if no message left
			if (room.messages.length === 0) {
				delete roomDict[roomId]
				console.log("delete room " + roomId)
			}
		}
		socket.joined = false
		socket.roomId = null
		// socket can leave room without disconnecting
		socket.leave(roomId)
		return removingUser
	},

	getUsersInRoom: roomId => {
		const room = roomDict[roomId]
		if (!room) {
			return []
		}
		const users = room.users
		const res = []
		Object.keys(users).forEach(function(userId) {
			const user = users[userId].user
			if (res.length < 50) {
				res.push(user)
			}
		})
		return res
	},
	getUserFromRoom: (userId, roomId) => {
		const room = roomDict[roomId]
		const users = room.users
		if (userId in users) {
			const userWithSockets = users[userId]
			return userWithSockets
		}
		return null
	},
	findRoomToJoin: pageTags => {
		// decide which room to join
		// or no room to join
		let closestRoom = null
		let threashold = SIMILARITY_THRESHOLD
		Object.values(roomDict).forEach(room => {
			const roomTags = room.tags
			const score = tagManager.similarityScore(pageTags, roomTags)

			if (score >= threashold) {
				// console.log(pageTags)
				// console.log(roomTags)
				// console.log("score: " + score)
				closestRoom = room
				threashold = score
			}
		})
		return closestRoom
	},
	createRoomForSocket: socket => {
		const roomId = (roomIdCount++).toString()
		roomManager.addSocketToRoom(socket, roomId)
		return roomDict[roomId]
	},
	adjustRoomTag: (room, newTags) => {
		// adjust room's tags based on users' page tags
		// Naive solution for now is only look the newly joined user
		// TODO: needs improvement!
		// E.g. if people are in [foo, bar, baz] room
		// one person with [foo, bar] will remove baz
		// while people with [foo, baz] later can no longer
		// console.log("adjust tags")
		// console.log(room.tags)
		// room.tags = tagManager.getSameTags(room.tags, newTags)
		// console.log(room.tags)
	},
	addSocketToRoom: (socket, roomId, readOnly, noTagAdjustment) => {
		// TODO: this function is confusing because it
		// also handles room creation, should leave that
		// to a separate function and this function always
		// assume room created

		// noTagAdjustment when user come in from discovery link

		// Add socket to room, track socket under user
		// if adding user to room, return true
		if (socket.joined) {
			roomManager.removeSocketFromRoom(socket)
		}

		let addingUser = false

		if (!(roomId in roomDict)) {
			// create room
			roomDict[roomId] = {
				id: roomId,
				messages: [],
				users: {}, // userId as key
				tags: socket.pageTags
			}
			console.log("create room " + roomId)
		} else {
			if (!noTagAdjustment) {
				roomManager.adjustRoomTag(roomDict[roomId], socket.pageTags)
			}
		}
		const room = roomDict[roomId]
		const users = room.users
		const userId = socket.user.id

		if (!(userId in users)) {
			users[userId] = {
				user: socket.user,
				sockets: new Set()
			}
			addingUser = true
		}

		const userWithSockets = users[userId]
		// always set user data from latest socket's user
		userWithSockets.user = socket.user
		userWithSockets.sockets.add(socket.id)

		socket.join(roomId)
		if (!readOnly) {
			socket.joined = true
			socket.roomId = roomId
		}
		return addingUser
	}
}
module.exports = roomManager
