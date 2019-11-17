"use strict"
// var fs = require("fs")
const express = require("express")
const bodyParser = require("body-parser")
const request = require("request")
const urls = require("./cfg/urls")
const metrics = require("./metrics")

const app = express()
const server = require("http").createServer(app)
const port = process.env.PORT || 8081

const io = require("socket.io")(server)
const utils = require("./utils.js")

const userManager = require("./user.js")
const tagManager = require("./tag.js")
const roomManager = require("./room.js")
// var invitationManager = require("./invitation.js")

const MSG_FREQUENCY_LIMIT = 3 * 1000
const MIN_CLIENT_VERSION = "4.1.0" // >= this version

let messageCount = 0
server.listen(port, function() {
	console.log("Server listening at port %d", port)
})

// allow ajax request from different domain, you can comment it out if you don't want it
app.use(function(req, res, next) {
	// Website you wish to allow to connect
	res.setHeader("Access-Control-Allow-Origin", "*")
	// Request methods you wish to allow
	res.setHeader(
		"Access-Control-Allow-Methods",
		"GET, POST, OPTIONS, PUT, PATCH, DELETE"
	)
	// Request headers you wish to allow
	res.setHeader(
		"Access-Control-Allow-Headers",
		"X-Requested-With,content-type,token"
	)
	// Set to true if you need the website to include cookies in the requests sent
	// to the API (e.g. in case you use sessions)
	res.setHeader("Access-Control-Allow-Credentials", true)
	// Pass to next layer of middleware
	next()
})

app.use(bodyParser.json())

app.get("/api/health_check", function(req, res) {
	metrics.increment("socket.api.health_check")
	res.send("ok")
})
app.get("/", function(req, res) {
	metrics.increment("socket.root")
	res.send("ok")
})
// app.get("/api/refresh_site_to_room_mapping", function(req, res) {
//   roomManager.setSiteToRoom(res)
// })
app.get("/api/popular_rooms", function(req, res) {
	metrics.increment("socket.api.popular_rooms")
	res.send(roomManager.getPopularRooms())
})
app.post("/api/tags", function(req, res) {
	metrics.increment("socket.api.tags")
	res.send(tagManager.getTags(req.body.title))
})
function countSocketAndUsers() {
	var userIds = {}
	Object.keys(io.sockets.sockets).forEach(function(sid) {
		userIds[io.sockets.sockets[sid].userId] = true
	})
	var socketCount = Object.keys(io.sockets.sockets).length
	var userCount = Object.keys(userIds).length
	metrics.gauge("socket.online_v5.users", userCount)
	metrics.gauge("socket.online_v5.sockets", socketCount)
}

function keepCountingSocketAndUsers() {
	countSocketAndUsers()
	setTimeout(function() {
		keepCountingSocketAndUsers()
	}, 10 * 1000)
}

// roomManager.setSiteToRoom()
// roomManager.loadRooms()
if (process.env.CHATBOX_ENV === "prod") keepCountingSocketAndUsers()

function isClientVersionOK(version) {
	return version >= MIN_CLIENT_VERSION
}

// Socket.io events
io.on("connection", function(socket) {
	socket.joined = false // not joined until logged in
	// console.log('connected');
	// Once the new user is connected, we ask him to login
	socket.emit("login", {})
	// TODO: may want to pass some data to user?

	socket.on("login", function(data) {
		metrics.increment("login")
		socket.clientVersion = data.version || "0.0.0"
		metrics.increment("client_version." + socket.clientVersion)
		if (!isClientVersionOK(socket.clientVersion)) {
			// TODO: injection script isn't showing any alert
			// about version too low in the UI
			socket.emit("alert", { errorCode: 426 })
			socket.disconnect()
			return
		}

		if (!(data.username && data.userId && data.roomId)) {
			socket.disconnect()
			return
		}
		socket.username = utils.stripHtml(data.username)
		socket.userId = utils.stripHtml(data.userId)
		socket.pageTitle = data.pageTitle
		console.log(socket.pageTitle)
		socket.pageTags = tagManager.getTags(socket.pageTitle)
		// language added in 2.3.3
		socket.lang = utils.stripHtml(data.lang)
		// url field is added in v2.6.0
		socket.url = utils.stripHtml(data.url)
		socket.token = data.token // added in v2.7.0
		socket.isVisitor = data.isVisitor
		// User manager decides if socket can join or not
		userManager.loginUser(socket, function(allowJoin) {
			if (allowJoin) {
				socket.spMode = "tags"

				let room = roomManager.findRoomToJoin(socket.pageTags)
				if (room) {
					const roomId = room.id
					const newUserJoined = roomManager.addSocketToRoom(
						socket,
						roomId
					)
					// Tell everyone new user joined
					if (newUserJoined) {
						io.in(roomId).emit("new user", {
							user: socket.user
						})
					}
				} else {
					room = roomManager.createRoomForSocket(socket)
				}

				socket.emit("*", {
					eventName: "login success"
				})
				// Tell this new socket who are already in the room
				socket.emit("users in room", {
					users: roomManager.getUsersInRoom(socket.roomId)
				})

				// TODO: recent messages and room info are not
				// needed unless chatbox is open, maybe let client
				// fetch these 2
				// socket.emit("recent messages", roomDict[roomId].messages)
				// socket.emit("*", {
				//   eventName: "room info",
				//   room: roomManager.getRoomInfo(socket.roomId),
				//   mode: socket.spMode
				// })
				metrics.increment("login.ok")
			} else {
				socket.disconnect()
			}
		})
	})

	// when the socket disconnects
	socket.on("disconnect", function() {
		// Only cares if user login and joined a room
		metrics.increment("disconnect")
		if (!socket.joined) {
			return
		}
		const roomId = socket.roomId
		const userLeft = roomManager.removeSocketFromRoom(socket)
		// io.in(socket.roomId).emit("stop typing", { username: socket.username })
		if (userLeft) {
			io.in(roomId).emit("user gone", {
				user: socket.user
			})
		}

		metrics.increment("disconnect_after_join")
	})

	// when the client emits 'new message', this listens and executes
	socket.on("new message", function(data) {
		if (!socket.joined) return
		var now = Date.now()
		var lastMsgTime = socket.lastMsgTime
		socket.lastMsgTime = now

		if (lastMsgTime && now - lastMsgTime < MSG_FREQUENCY_LIMIT) {
			socket.emit("alert", { errorCode: 429 })
			metrics.increment("alert.message.429")
			return
		}
		data.msg = data.msg || ""
		let cleanedMsg = utils.stripHtml(data.msg)
		let messageType = "text"
		let mediaSrc = null
		let mediaType = null
		let metadata = null
		if (data.type) {
			// client may send type directly, e.g. type: invite
			// then server don't need to decide type
			messageType = data.type
		} else if (cleanedMsg.startsWith("stickers/")) {
			// sticker check must be after image check
			// since stickers ends with .gif
			messageType = "sticker"
		} else if (utils.isPureEmoji(cleanedMsg)) {
			messageType = "emoji"
		} else if (
			cleanedMsg.includes("youtube.com") ||
			cleanedMsg.includes("youtu.be")
		) {
			messageType = "video"
			mediaSrc = cleanedMsg
			cleanedMsg = "Youtube ID:" + cleanedMsg.split("=").pop()
			mediaType = "video/youtube"
		} else if (cleanedMsg.includes("music.163.com")) {
			const songId = cleanedMsg.split("=").pop()
			messageType = "audio"
			mediaSrc =
				"https://music.163.com/song/media/outer/url?id=" +
				songId +
				".mp3"
			cleanedMsg = "网易云音乐 ID:" + songId
		} else if (
			cleanedMsg.toLowerCase().match(/\.(mp4|webm|ogg|flv|mov)/) != null
		) {
			messageType = "video"
			mediaSrc = cleanedMsg
			cleanedMsg = cleanedMsg.split("/").pop()
		} else if (cleanedMsg.toLowerCase().match(/\.(mp3|wav)/) != null) {
			messageType = "audio"
			mediaSrc = cleanedMsg
			cleanedMsg = cleanedMsg.split("/").pop()
		} else if (
			cleanedMsg.toLowerCase().match(/\.(jpeg|jpg|gif|png|webp)/) != null
		) {
			messageType = "image"
		}
		// Done with guessing message type

		if (messageType === "text") {
			if (cleanedMsg.length > 150) {
				cleanedMsg = cleanedMsg.substring(0, 150)
			}
			console.log(
				"[" + socket.roomId + "] " + socket.username + ": " + data.msg
			)
		}
		if (messageType === "invite") {
			// invitationManager.sendInvitation(socket, data, io, messageCount++)
			console.log(
				"[" +
					socket.roomId +
					"] " +
					socket.username +
					" invite: " +
					data.url
			)
			// return
			cleanedMsg = data.title
			metadata = {
				type: data.invitationType,
				purpose: data.invitationPurpose,
				pageTitle: data.title,
				pageUrl: data.url
			}
			// TODO: no need to change room for v5.0
			// const readOnly = true
			// addSocketToRoom(socket, data.url, readOnly)
		}
		const messageId = messageCount++
		var payload = {
			id: messageId,
			user: socket.user,
			userId: socket.userId,
			content: cleanedMsg,
			type: messageType,
			mediaSrc: mediaSrc,
			mediaType: mediaType,
			metadata: metadata,
			roomId: socket.roomId
		}
		io.in(socket.roomId).emit("new message", payload)
		roomManager.addMsgToRoomHistory(
			{
				...payload,
				timestamp: Date.now()
			},
			socket.roomId
		)
		metrics.increment("message")
	})

	// when the client emits 'typing', we broadcast it to others
	socket.on("typing", function(data) {
		if (!socket.joined) return
		io.in(socket.roomId).emit("typing", {
			username: socket.username,
			userId: socket.userId
		})
		metrics.increment("typing")
	})

	// when the client emits 'stop typing', we broadcast it to others
	socket.on("stop typing", function(data) {
		if (!socket.joined) return
		io.in(socket.roomId).emit("stop typing", {
			username: socket.username,
			userId: socket.userId
		})
		metrics.increment("typing_stop")
	})

	socket.on("page update", function(data) {
		// added in 4.0
		if (!socket.joined) return

		socket.pageTitle = data.title
		socket.pageTags = tagManager.getTags(socket.pageTitle)
		socket.url = data.url
		socket.spMode = "tags"
		// leave current room then join the new room
		const userLeft = roomManager.removeSocketFromRoom(socket)
		if (userLeft) {
			io.in(socket.roomId).emit("user gone", {
				user: socket.user
			})
		}

		let room = roomManager.findRoomToJoin(socket.pageTags)
		if (room) {
			const newUserJoined = roomManager.addSocketToRoom(socket, room.id)
			// Tell everyone new user joined
			if (newUserJoined) {
				io.in(room.id).emit("new user", {
					user: socket.user
				})
			}
		} else {
			room = roomManager.createRoomForSocket(socket)
		}

		// Tell this new socket who are already in the room
		socket.emit("users in room", {
			users: roomManager.getUsersInRoom(room.id)
		})
		socket.emit("*", {
			eventName: "room info",
			// room: roomManager.getRoomInfo(socket.roomId),
			room: roomManager.getRoomInfo(room.id),
			mode: socket.spMode
		})
		// TODO?: no need to get this if chatbox not open
		socket.emit("recent messages", room.messages)
		metrics.increment("page_update")
	})

	socket.on("get room info", function(data) {
		// added in 4.1.1
		// use case is when iframe is mounted, it
		// needs to get room info

		// 4.1.5 include the invitation user received
		// because user might not have chat box open
		// and want to see the invitation
		if (!socket.joined) return
		const room = roomManager.getRoom(socket.roomId)
		if (!room) {
			console.error("room not exist!")
			return
		}
		socket.emit("users in room", {
			users: roomManager.getUsersInRoom(socket.roomId)
		})
		// deep copy so we don't modify room messages
		// const roomMessages = [...room.messages]
		// if (socket.invitation) {
		//   roomMessages.push(socket.invitation)
		// }
		// socket.emit("recent messages", roomMessages)
		socket.emit("recent messages", room.messages)
		socket.emit("*", {
			eventName: "room info",
			room: roomManager.getRoomInfo(socket.roomId),
			mode: socket.spMode
		})

		metrics.increment("get room info")
	})

	socket.on("change room", data => {
		if (!socket.joined) return
		if (!data.roomId) return
		const roomId = data.roomId.toString()
		if (socket.roomId === roomId) return

		// leave current room then join the new room
		const userLeft = roomManager.removeSocketFromRoom(socket)

		if (userLeft) {
			io.in(socket.roomId).emit("user gone", {
				user: socket.user
			})
		}

		socket.roomId = roomId
		socket.spMode = data.mode
		const newUserJoined = roomManager.addSocketToRoom(
			socket,
			roomId,
			false,
			true
		)

		// Tell everyone new user joined
		if (newUserJoined) {
			io.in(roomId).emit("new user", {
				user: socket.user
			})
		}
		// Tell this new socket who are already in the room
		socket.emit("users in room", {
			users: roomManager.getUsersInRoom(roomId)
		})
		socket.emit("*", {
			eventName: "room info",
			// room: roomManager.getRoomInfo(socket.roomId),
			room: roomManager.getRoom(roomId), // entire room object, too much data?
			mode: socket.spMode
		})
		socket.emit("recent messages", roomManager.getRoom(roomId).messages)

		// remember user's choice of room
		// do not remember mode
		// TODO: do I need below code?
		const mode = data.mode
		if (mode === "room") {
			request.post(
				{
					url: urls.dbAPI + "/api/v1/change_room",
					json: {
						// mode: mode,
						room: roomId
					},
					headers: {
						token: socket.token
					}
				},
				function optionalCallback(err, httpResponse, body) {
					if (err) {
						console.error("Failed to remember mode/room", err)
						return
					}
					if (httpResponse.statusCode === 200) {
						// console.log("remembered")
					} else {
						console.error(
							"Failed to remember mode/room " +
								httpResponse.statusCode
						)
					}
				}
			)
		}
	})

	socket.on("private message", function(data) {
		// added in 4.1.1
		if (!socket.joined) return
		const receiverId = data.userId
		const roomId = socket.roomId
		const receiver = roomManager.getUserFromRoom(receiverId, roomId)
		if (receiver) {
			receiver.sockets.forEach(sid => {
				const s = io.sockets.sockets[sid]
				if (s) {
					s.emit("private message", { user: socket.user })
				}
			})
		}
		metrics.increment("private message")
	})

	socket.on("kick user", function(data) {
		// added in 4.1.2
		if (!socket.joined) return
		// First check if user has permission to kick others
		const user = socket.user
		if (!user || !user.isMod) {
			socket.emit("alert", { errorCode: 409 })
			return
		}
		const userIdToBeKicked = data.userId
		const roomId = socket.roomId
		const receiver = roomManager.getUserFromRoom(userIdToBeKicked, roomId)
		if (receiver) {
			if (receiver.user.role >= user.role) {
				socket.emit("alert", { errorCode: 409 })
				return
			}
			receiver.sockets.forEach(sid => {
				const s = io.sockets.sockets[sid]
				if (s) {
					// TODO: tell people in this room about the kick
					s.emit("alert", { errorCode: 403 })
					s.disconnect()
				}
			})
		}
		metrics.increment("kick user")
	})

	socket.on("delete message", function(data) {
		// added in 4.1.2
		if (!socket.joined || !socket.user) return
		// User himself or mod can delete message
		const user = socket.user
		const messageId = data.messageId
		const roomId = socket.roomId
		let messages = roomManager.getRoom(roomId).messages
		// the message we want to delete maybe no longer in memory
		const messageToBeDeleted = messages.find(msg => {
			return msg.id === messageId
		})
		if (messageToBeDeleted) {
			// check permission
			if (!user.isMod && messageToBeDeleted.userId !== user.id) {
				socket.emit("alert", { errorCode: 409 })
				return
			}
		}
		messages = messages.filter(msg => {
			return msg.id !== messageId
		})
		roomManager.getRoom(roomId).messages = messages
		io.in(roomId).emit("recent messages", messages)
		metrics.increment("delete message")
	})
	metrics.increment("connection")
})
