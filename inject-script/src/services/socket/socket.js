import { socketUrl } from "config/urls"
import { getDomain, getUrl } from "utils/url"
import { postMsgToIframe } from "utils/iframe"
import accountManager from "services/account"
// import roomManager from "services/room"
import storage from "storage.js"

let _socket = null
const lang = window.navigator.userLanguage || window.navigator.language
// let _account = null

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
		window.leftRoom()
	} else {
		console.warn("socket not connected, no need to disconnect")
	}
}

const _joinRoom = triggeredByChatbox => {
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
					lang: lang,
					version: _getClientVersion,
					rooms: filteredRooms,
					token: accountManager.getAccount().token,
					getChatHistory: triggeredByChatbox
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
		_connect(true)
		// TODO: show message not sent
		// User should know they are offline and UI
		// should block them from doing anything if offline.
	}
}

const _connect = triggeredByChatbox => {
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
		_joinRoom(triggeredByChatbox)
		return
	}
	window.spDebug("create socket and connect!")

	_socket = new WebSocket("wss://" + socketUrl)

	_socket.onopen = e => {
		window.spDebug("websocket connected")
		// window.spDebug(e)
		if (_isConnected()) {
			_joinRoom(triggeredByChatbox)
		} else {
			window.spDebug("websocket not connected?")
		}
	}

	_socket.onmessage = e => {
		// window.spDebug("received msg")

		const msg = JSON.parse(e.data)
		if (!msg) return

		_postSocketMsgToIframe(msg)

		if (msg === "not logged in!") {
			window.spDebug("[socket] not logged in, removing local account")
			storage.set("account", null)
		}

		const data = msg.data
		if (msg.name === "left room") {
			window.leftRoom(data.roomId)
		}
		if (msg.name === "other join") {
			const user = data.user
			window.addUserToRoom(data.roomType, user)
		}
		if (msg.name === "other left") {
			const user = data.user
			window.removeUserFromRoom(data.roomType, user)
		}
		if (msg.name === "room info") {
			window.setUsersInRoom(data)
		}
		if (msg.name === "chat message") {
			data.self =
				data.user.id.toString() === accountManager.getAccount().id.toString()

			window.setUserMessage(data.user, data.roomType, data.content)
			window.queueAnimationDanmu(data)
			storage.set(data.roomId + "-msg-last-timestamp", Date.now())
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
}

const _postSocketMsgToIframe = data => {
	postMsgToIframe("sp-socket", data)
}

const socketManager = {
	sendEvent: msg => {
		_sendEvent(msg)
	},
	// updatePageInfo: data => {
	// 	if (_socket && _socket.connected) _socket.emit("page update", data)
	// 	else {
	// 		console.error("socket not connected")
	// 	}
	// },
	connect: _connect,
	// changeRoom: roomId => {
	// 	window.spDebug("TODO: change room")
	// 	// _roomId = roomId
	// 	// _disconnect()
	// 	// setTimeout(() => {
	// 	// 	_connect()
	// 	// }, 500)
	// },
	disconnect: _disconnect
}

export default socketManager

window.addEventListener(
	"message",
	e => {
		if (!e || !e.data) return

		const data = e.data.data
		if (e.data.type === "sp-socket") {
			if (data === "disconnect socket") {
				socketManager.disconnect()
			}
			socketManager.sendEvent(data)
		}
	},
	false
)
