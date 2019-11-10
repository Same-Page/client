import * as io from "socket.io-client"

import { socketUrl } from "config/urls"
import { getDomain, getUrl } from "utils/url"
import { postMsgToIframe } from "utils/iframe"
import accountManager from "services/account"
import roomManager from "services/room"
import { addUserToCache, getUserFromCache } from "services/user"

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
  if (_socket) {
    if (_socket.connected) {
      console.debug("disconnect socket")
      _socket.disconnect()
      window.setUserCount(0)
    } else {
      console.warn("socket not connected, no need to disconnect")
    }
  } else {
    console.warn("socket not created, nothing to disconnect")
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
  if (_socket) {
    console.debug("socket already created, just reconnect")
    if (_socket.connected) {
      console.warn("socket already connected")
    } else {
      _socket.connect()
    }
    return
  } else {
    console.debug("create socket and connect!")
  }
  _socket = io(socketUrl, { path: "/socket.io" })
  window.spSocket = _socket
  _socket.on("login", data => {
    console.debug("connected, will login as " + accountManager.getAccount().id)
    _postSocketMsgToIframe("login", data)
    _socket.emit("login", {
      // TODO: shouldn't need to pass username, userId
      // any more, socket server always gets the user from token
      username: accountManager.getAccount().name,
      userId: accountManager.getAccount().id,
      isVisitor: accountManager.getAccount().isVisitor,
      roomId: _roomId,
      url: getUrl(), // maybe shouldn't send this
      version: _getClientVersion(),
      lang: lang,
      pageTitle: document.title, // maybe shouldn't send this
      token: accountManager.getAccount().token
    })
  })
  _socket.on("new message", data => {
    data.self =
      data.userId.toString() === accountManager.getAccount().id.toString()
    const user = getUserFromCache(data.userId)
    data.user = data.user || user

    _postSocketMsgToIframe("new message", data)
    window.queueAnimationDanmu(data)
  })
  _socket.on("private message", data => {
    _postSocketMsgToIframe("private message", data)
  })

  _socket.on("recent messages", data => {
    _postSocketMsgToIframe("recent messages", data)
  })
  _socket.on("users in room", data => {
    const users = data.users
    _postSocketMsgToIframe("users in room", users)
    // console.debug("user count")
    // console.debug(data)
    users.forEach(user => {
      addUserToCache(user)
    })
    roomManager.setUsersInRoom(users)
  })
  _socket.on("new user", data => {
    const user = data.user
    _postSocketMsgToIframe("new user", user)
    addUserToCache(user)
    roomManager.addUserToRoom(user)
  })
  _socket.on("user gone", data => {
    const user = data.user
    roomManager.removeUserFromRoom(user)
    _postSocketMsgToIframe("user gone", user)
  })
  _socket.on("disconnect", data => {
    roomManager.setUsersInRoom([])
    _postSocketMsgToIframe("disconnect", data)
  })
  _socket.on("alert", data => {
    console.debug(data)
    _postSocketMsgToIframe("alert", data)
    if (data.errorCode === 401) {
      accountManager.logout()
    }
  })
  _socket.on("*", data => {
    _postSocketMsgToIframe(data.eventName, data)
    if (data.eventName === "invitation") {
      const purposeStr = data.metadata.purpose === "chat" ? "聊天邀请" : "求助"
      const invitationStr = `向你发出${purposeStr}`
      data.content = invitationStr
      window.queueAnimationDanmu(data)
    }
  })
}

const _postSocketMsgToIframe = (name, data) => {
  postMsgToIframe(name, "sp-socket", data)
}

const socketManager = {
  sendMessage: msg => {
    if (_socket && _socket.connected) {
      _socket.emit("new message", msg)
    } else {
      console.error("socket not connected")
    }
  },
  updatePageInfo: data => {
    if (_socket && _socket.connected) _socket.emit("page update", data)
    else {
      console.error("socket not connected")
    }
  },
  connect: _connect,
  changeRoom: roomId => {
    console.debug("change room")
    _roomId = roomId
    _disconnect()
    setTimeout(() => {
      _connect()
    }, 500)
  },
  disconnect: _disconnect
}

export default socketManager

window.addEventListener(
  "message",
  e => {
    if (!e || !e.data || e.data.type !== "sp-socket") return
    const data = e.data
    if (data.action === "send message v2") {
      const payload = data.msg
      if (payload.type === "invite") {
        payload.title = document.title
        payload.url = window.location.href
      }
      socketManager.sendMessage(payload)
    }
    if (data.action === "change room") {
      socketManager.changeRoom(data.roomId)
    }
    if (data.action === "send event") {
      // Simply send event through proxy
      // console.debug(data.eventName)
      if (_socket) {
        _socket.emit(data.eventName, data.data)
      } else {
        console.warn("no socket")
      }
    }
  },
  false
)
