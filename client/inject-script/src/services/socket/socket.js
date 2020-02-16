// import { socketUrl } from "config/urls"
import { getDomain, getUrl } from "utils/url"
import { postMsgToIframe } from "utils/iframe"
import accountManager from "services/account"
import roomManager from "services/room"
import storage from "storage.js"

// import { addUserToCache, getUserFromCache } from "services/user"

let _socket = null
const lang = window.navigator.userLanguage || window.navigator.language
// let _account = null
let _roomId = getDomain()

const _getClientVersion = () => {
	let version = "999" // not ran as chrome extension
	if (
		window.chrome &&
		window.chrome.runtime &&
		window.chrome.runtime.getManifest
	) {
		version = window.chrome.runtime.getManifest().version
	}
	return version
}

const _disconnect = () => {
	if (_isConnected()) {
		window.spDebug("disconnect socket")
		_socket.close()
		roomManager.clear()
	} else {
		console.warn("socket not connected, no need to disconnect")
	}
}

const _joinRoom = () => {
	// TODO: read modes from config
	// also need to know which man-made room to join
	storage.get("room", room => {
		const rooms = [
			{
				type: "page",
				id: getUrl()
			},
			{
				type: "site",
				id: getDomain()
			}
		]
		if (room) {
			rooms.push(room)
		}
		window.spDebug("[Inject] rooms")
		window.spDebug(rooms)
		storage.get("noJoin", noJoin => {
			noJoin = noJoin || []
			const filteredRooms = rooms.filter(r => {
				return !noJoin.includes(r.id)
			})
			window.spDebug("[Inject] filtered rooms")
			window.spDebug(filteredRooms)
			const payload = {
				action: "join",
				data: {
					rooms: filteredRooms,
					token: accountManager.getAccount().token
				}
			}
			_sendEvent(payload)
		})
	})
}

const _isConnected = () => {
	return _socket && _socket.readyState === _socket.OPEN
}
const _sendEvent = msg => {
	// console.log(msg)
	if (msg && msg.data && msg.data.content) {
		msg.data.content.title = document.title
	}
	// always inject page title and url?
	// window.spDebug(msg)
	if (_isConnected()) {
		_socket.send(JSON.stringify(msg))
	} else {
		console.error("socket not connected")
		_connect()
		// TODO: show message not sent
		// User should know they are offline and UI
		// should block them from doing anything if offline.
	}
}

const _connect = () => {
	// connect should be called when user is logged in
	// after user data is properly set
	// socket is initilized only once, callbacks are registered
	// only once, should only update socket config but not callbacks
	if (!accountManager.loggedIn()) {
		console.error("cannot connect because user not logged in")
		return
	}
	if (_isConnected()) {
		window.spDebug("socket already connected, try joining room")
		_joinRoom()
		return
	}
	window.spDebug("create socket and connect!")

	_socket = new WebSocket(
		"wss://7dvmt9p591.execute-api.ap-southeast-1.amazonaws.com/prod"
	)

	_socket.onopen = e => {
		window.spDebug("websocket connected")
		// window.spDebug(e)
		if (_isConnected()) {
			_joinRoom()
		} else {
			window.spDebug("websocket not connected?")
		}
	}

	_socket.onmessage = e => {
		// window.spDebug("received msg")
		// console.log(e.data)
		const msg = JSON.parse(e.data)
		if (!msg) return
		_postSocketMsgToIframe(msg)
		const data = msg.data
		if (msg.name === "other join") {
			const roomId = data.roomId
			const user = data.user
			// window.spDebug("other join")
			// window.spDebug(data)
			// addUserToCache(user)
			roomManager.addUserToRoom(roomId, user)
		}
		if (msg.name === "other left") {
			const roomId = data.roomId
			const user = data.user
			// window.spDebug("other join")
			// window.spDebug(data)
			// addUserToCache(user)
			roomManager.removeUserFromRoom(roomId, user)
		}
		if (msg.name === "room info") {
			Object.keys(data).forEach(roomId => {
				const room = data[roomId]
				if (room.users) {
					roomManager.setUsersInRoom(roomId, room.users)
				}
			})
		}
		if (msg.name === "chat message") {
			data.self =
				data.user.id.toString() ===
				accountManager.getAccount().id.toString()

			window.queueAnimationDanmu(msg.data)
		}
	}

	_socket.onclose = e => {
		// websocket is closed.
		// window.spDebug(e)
		window.spDebug("socket is closed...")
		_postSocketMsgToIframe("disconnect")
		if (accountManager.getAccount()) {
			setTimeout(() => {
				_connect()
			}, 10 * 1000)
		}
	}

	window.spSocket = _socket
	// _socket.on("login", data => {
	// 	window.spDebug(
	// 		"connected, will login as " + accountManager.getAccount().id
	// 	)
	// 	_postSocketMsgToIframe("login", data)
	// 	_socket.emit("login", {
	// 		// TODO: shouldn't need to pass username, userId
	// 		// any more, socket server always gets the user from token
	// 		username: accountManager.getAccount().name,
	// 		userId: accountManager.getAccount().id,
	// 		isVisitor: accountManager.getAccount().isVisitor,
	// 		roomId: _roomId,
	// 		url: getUrl(), // maybe shouldn't send this
	// 		version: _getClientVersion(),
	// 		lang: lang,
	// 		pageTitle: document.title, // maybe shouldn't send this
	// 		token: accountManager.getAccount().token
	// 	})
	// })
	// _socket.on("new message", data => {
	// 	data.self =
	// 		data.userId.toString() === accountManager.getAccount().id.toString()
	// 	const user = getUserFromCache(data.userId)
	// 	data.user = data.user || user

	// 	_postSocketMsgToIframe("new message", data)
	// 	window.queueAnimationDanmu(data)
	// })
	// _socket.on("private message", data => {
	// 	_postSocketMsgToIframe("private message", data)
	// })

	// _socket.on("recent messages", data => {
	// 	_postSocketMsgToIframe("recent messages", data)
	// })
	// _socket.on("users in room", data => {
	// 	const users = data.users
	// 	_postSocketMsgToIframe("users in room", users)
	// 	// window.spDebug("user count")
	// 	// window.spDebug(data)
	// 	users.forEach(user => {
	// 		addUserToCache(user)
	// 	})
	// 	roomManager.setUsersInRoom(users)
	// })
	// _socket.on("new user", data => {
	// 	const user = data.user
	// 	_postSocketMsgToIframe("new user", user)
	// 	addUserToCache(user)
	// 	roomManager.addUserToRoom(user)
	// })
	// _socket.on("user gone", data => {
	// 	const user = data.user
	// 	roomManager.removeUserFromRoom(user)
	// 	_postSocketMsgToIframe("user gone", user)
	// })
	// _socket.on("disconnect", data => {
	// 	roomManager.setUsersInRoom([])
	// 	_postSocketMsgToIframe("disconnect", data)
	// })
	// _socket.on("alert", data => {
	// 	window.spDebug(data)
	// 	_postSocketMsgToIframe("alert", data)
	// 	if (data.errorCode === 401) {
	// 		accountManager.logout()
	// 	}
	// })
	// _socket.on("*", data => {
	// 	_postSocketMsgToIframe(data.eventName, data)
	// 	if (data.eventName === "invitation") {
	// 		const purposeStr =
	// 			data.metadata.purpose === "chat" ? "聊天邀请" : "求助"
	// 		const invitationStr = `向你发出${purposeStr}`
	// 		data.content = invitationStr
	// 		window.queueAnimationDanmu(data)
	// 	}
	// })
}

const _postSocketMsgToIframe = data => {
	postMsgToIframe("sp-socket", data)
}

const socketManager = {
	sendEvent: msg => {
		_sendEvent(msg)
	},
	updatePageInfo: data => {
		if (_socket && _socket.connected) _socket.emit("page update", data)
		else {
			console.error("socket not connected")
		}
	},
	connect: _connect,
	changeRoom: roomId => {
		window.spDebug("TODO: change room")
		// _roomId = roomId
		// _disconnect()
		// setTimeout(() => {
		// 	_connect()
		// }, 500)
	},
	disconnect: _disconnect
}

export default socketManager

window.addEventListener(
	"message",
	e => {
		if (!e || !e.data || e.data.type !== "sp-socket") return
		const data = e.data.data
		if (data === "disconnect socket") {
			return socketManager.disconnect()
		}
		socketManager.sendEvent(data)
	},
	false
)
