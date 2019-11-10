const tagManager = require("./tag.js")

const SIMILARITY_THRESHOLD = 0.1
const LOBBY_ROOM_ID = "5"

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
    getRoom: (roomId) => {
        return roomDict[roomId]
    },
    getPopularRooms: () => {
        // might be too slow to sort all rooms
        // so we filter to find room with at least 2 users first
        const rooms = Object.values(roomDict).filter((room) => {
            return Object.keys(room.users).length > 1
        })
        rooms.sort((a, b) => {
            return Object.keys(b.users).length - Object.keys(a.users).length
        })
        return rooms
    },
    addMsgToRoomHistory: (message, roomId) => {
        // Save message to room object, only keep latest ten
        const room = roomDict[roomId]
        room.messages.push(message)
        if (room.messages.length > 50) {
        room.messages.shift()
        }
    },
    removeSocketFromRoom: (socket) => {
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
        // delete room
        // 6/6/2019 9:00 am, commenting this out
        // since we don't have many users and we want
        // to keep recent messages of each room
    
        if (room.messages.length === 0) {
            // 6/11 memory goes to 2G super fast
            delete roomDict[roomId]
        }
        }
        socket.joined = false
        // socket can leave room without disconnecting
        socket.leave(roomId)
        return removingUser
    },
  
    getUsersInRoom: (roomId) => {
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
    findRoomToJoin: (pageTags) => {
        // decide which room to join
        // or no room to join
        let closestRoom = null
        let threashold = SIMILARITY_THRESHOLD
        Object.values(roomDict).forEach((room)=>{
            const roomTags = room.tags
            const score = tagManager.similarityScore(pageTags, roomTags)
            // console.log(pageTags)
            // console.log(roomTags)
            // console.log('score: ' + score)
            if (score > threashold) {
                closestRoom = room
                threashold = score
            }
        })
        return closestRoom
    },
    createRoomForSocket: (socket) => {
        const roomId = roomIdCount++;
        roomManager.addSocketToRoom(socket, roomId)
        return roomDict[roomId]
    },
    addSocketToRoom: (socket, roomId, readOnly) => {
        // Add socket to room, track socket under user
        // if adding user to room, return true
        let addingUser = false
      
        if (!(roomId in roomDict)) {
          roomDict[roomId] = {
            id: roomId,
            messages: [],
            users: {}, // userId as key
            tags: socket.pageTags
          }
          console.log('create room ' + roomId)
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
