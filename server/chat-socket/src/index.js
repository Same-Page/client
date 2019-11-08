"use strict"
// var fs = require("fs")
const express = require("express")
const request = require("request")
const urls = require("./cfg/urls")
const metrics = require("./metrics")
const stopword = require('stopword')
const cnTokenizer = require("nodejieba")
const containsChinese = require('contains-chinese')

const app = express()
const server = require("http").createServer(app)
const port = process.env.PORT || 8081

const io = require("socket.io")(server)
const utils = require("./utils.js")

const userManager = require("./user.js")
// const roomManager = require("./room.js")
// var invitationManager = require("./invitation.js")

const MSG_FREQUENCY_LIMIT = 3 * 1000
const MIN_CLIENT_VERSION = "4.1.0" // >= this version

const LOBBY_ROOM_ID = "5"

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
let roomIdCount = 0
var roomDict = {} // key: roomId, value: dict of sockets

var popularRooms = []
// Note that lobby is a special case, room.url is
// irrelevant to room.roomId for lobby
// let's handle lobby separately
function addToPopRoom(socket) {
  if (!(socket.url && socket.pageTitle && socket.roomId)) return
  if (socket.roomId === LOBBY_ROOM_ID) return
  var room = {
    url: socket.url,
    roomId: socket.roomId,
    title: socket.pageTitle
    // this is actually socket count, not user count,
    // but close enough, if we want to make this correct,
    // instead of counting every time, we should add user count
    // attribute to room object
    // Set when api is called
    // userCount: roomDict[socket.roomId].length
  }
  popularRooms = popularRooms.filter(function(r) {
    // check all fields, no fields can be equal.
    // If we only check room id, page and site on same url
    // will show up twice with same page title, since we
    // don't have site title
    // E.g. {roomId: foo.com, url: foo.com/123} vs
    // {roomId: foo.com/123, url: foo.com/123}
    return r.roomId != room.roomId && r.url != room.url
  })
  popularRooms.unshift(room)
  if (popularRooms.length > 5) {
    popularRooms.pop()
  }
}
function addMsgToRoomHistory(message, roomId) {
  // Save message to room object, only keep latest ten
  const room = roomDict[roomId]
  room.messages.push(message)
  if (room.messages.length > 50) {
    room.messages.shift()
  }
}
function insert_spacing(str) {
  //将汉字与英文、数字、下划线之间添加一个空格
  var p1=/([A-Za-z_])([\u4e00-\u9fa5]+)/gi;
  var p2=/([\u4e00-\u9fa5]+)([A-Za-z_])/gi;
  return str.replace(p1, "$1 $2").replace(p2, "$1 $2")
}
function addSocketToRoom(socket, roomId, readOnly) {
  // Add socket to room, track socket under user
  // if adding user to room, return true

  // roomDict = {
  //   roomId: {
  //     id: roomId,
  //     users: {
  //        userId: {
  //          user: {},
  //          sockets: set of socket ids
  //          }
  //     },
  //     messages: [],
  //     tags: ['Nike', 'shoes', 'discount']
  //   }
  // }
  let addingUser = false

  if (!(roomId in roomDict)) {
    roomDict[roomId] = {
      id: roomId,
      messages: [],
      users: {}, // userId as key
      tags: socket.pageTags
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

function removeSocketFromRoom(socket) {
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
}

function getUsersInRoom(roomId) {
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
}

function getUserFromRoom(userId, roomId) {
  const room = roomDict[roomId]
  const users = room.users
  if (userId in users) {
    const userWithSockets = users[userId]
    return userWithSockets
  }
  return null
}

function similarityScore(inputTags, baseTags) {
  let matchCount = 0
  inputTags.forEach((tag)=>{
    if (baseTags.includes(tag)) {
      matchCount ++;
    }
  })
  return matchCount / inputTags.length
}

function findRoomToJoin(pageTags) {
  // decide which room to join
  // or no room to join
  let closestRoom = null
  let threashold = 0.5
  roomDict.forEach((roomId)=>{
    const room = roomDict[roomId]
    const roomTags = room.tags
    const score = similarityScore(pageTags, roomTags)
    if (score > threashold) {
      closestRoom = room
      threashold = score
    }
  })
  if (room) {
    return room.id
  }
  return roomIdCount++
}

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
  // roomManager.getRooms(req.headers.token, rooms => {
  //   if (rooms) {
  //     rooms.forEach(room => {
  //       const roomId = room.id
  //       room.userCount =
  //         roomId in roomDict ? Object.keys(roomDict[roomId].users).length : 0
  //     })
  //     rooms.sort((b, a) => {
  //       return a.userCount - b.userCount
  //     })
  //     res.send(rooms)
  //   } else {
  //     res.send(500)
  //   }
  // })
  // TODO: return pop rooms
  res.send([])
})

function countSocketAndUsers() {
  var userIds = {}
  Object.keys(io.sockets.sockets).forEach(function(sid) {
    userIds[io.sockets.sockets[sid].userId] = true
  })
  var socketCount = Object.keys(io.sockets.sockets).length
  var userCount = Object.keys(userIds).length
  metrics.gauge("socket.online_v2.users", userCount)
  metrics.gauge("socket.online_v2.sockets", socketCount)
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
      socket.emit("alert", { errorCode: 426 })
      socket.disconnect()
      return
    }

    if (!(data.username && data.userId && data.roomId)) {
      socket.disconnect()
      return
    }
    // socket.shareLocation = data.shareLocation
    socket.username = utils.stripHtml(data.username)
    socket.userId = utils.stripHtml(data.userId)
    socket.pageTitle = data.pageTitle
    console.log(socket.pageTitle)
    const pageTitlePatchedWithSpace = insert_spacing(socket.pageTitle)
    let tokens = pageTitlePatchedWithSpace.split(/(?:,|:|：|-| )+/) 
    let pageTags = []
    tokens.forEach((token) => {
      if (containsChinese(token)) {
        let cnTokens = cnTokenizer.cut(token)
        pageTags.push(...cnTokens)
      } else {
        pageTags.push(token)
      }
    })
    pageTags = stopword.removeStopwords(pageTags)
    console.log(pageTags)
    socket.pageTags = pageTags
    // language added in 2.3.3
    socket.lang = utils.stripHtml(data.lang)
    // url field is added in v2.6.0
    socket.url = utils.stripHtml(data.url)
    socket.token = data.token // added in v2.7.0
    socket.isVisitor = data.isVisitor
    // User manager decides if socket can join or not
    userManager.loginUser(socket, function(allowJoin) {
      if (allowJoin) {

        // Below is legacy code for joining page/site/room 
        // const mode = socket.user.mode
        // let roomId = socket.user.room || LOBBY_ROOM_ID
        // socket.spMode = mode
        // if (mode === "page") {
        //   roomId = socket.url
        //   socket.spMode = "page"
        // } else if (mode === "site") {
        //   const roomForSite = roomManager.siteToRoom(data.roomId)
        //   if (roomForSite) {
        //     roomId = roomForSite.id
        //     socket.spMode = "room"
        //     // console.debug("site should go to room " + roomId)
        //   } else {
        //     roomId = data.roomId
        //     socket.spMode = "site"
        //   }
        // }
        // roomId = roomId.toString()
        // Above is legacy code for joining page/site/room
        let roomId = findRoomToJoin(pageTags)

        const newUserJoined = addSocketToRoom(socket, roomId)
        // console.log(roomId)
        // Tell everyone new user joined
        if (newUserJoined) {
          io.in(roomId).emit("new user", {
            user: socket.user
          })
        }
        socket.emit("*", {
          eventName: "login success"
        })
        // Tell this new socket who are already in the room
        socket.emit("users in room", {
          users: getUsersInRoom(roomId)
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
    const userLeft = removeSocketFromRoom(socket)
    // io.in(socket.roomId).emit("stop typing", { username: socket.username })
    if (userLeft) {
      io.in(socket.roomId).emit("user gone", {
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
        "https://music.163.com/song/media/outer/url?id=" + songId + ".mp3"
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
        "[" + socket.roomId + "] " + socket.username + " invite: " + data.url
      )
      // return
      cleanedMsg = "发出邀请"
      metadata = {
        type: data.invitationType,
        purpose: data.invitationPurpose,
        pageTitle: data.title,
        pageUrl: data.url
      }
      // TODO: no need to change room for v5.0
      const readOnly = true
      addSocketToRoom(socket, data.url, readOnly)
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
    addMsgToRoomHistory(
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
    socket.url = data.url
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
    const room = roomDict[socket.roomId]
    if (!room) {
      return
    }
    socket.emit("users in room", {
      users: getUsersInRoom(socket.roomId)
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
      // room: roomManager.getRoomInfo(socket.roomId),
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
    const userLeft = removeSocketFromRoom(socket)

    if (userLeft) {
      io.in(socket.roomId).emit("user gone", {
        user: socket.user
      })
    }

    socket.roomId = roomId
    socket.spMode = data.mode
    const newUserJoined = addSocketToRoom(socket, roomId)

    // Tell everyone new user joined
    if (newUserJoined) {
      io.in(roomId).emit("new user", {
        user: socket.user
      })
    }
    // Tell this new socket who are already in the room
    socket.emit("users in room", {
      users: getUsersInRoom(roomId)
    })
    socket.emit("*", {
      eventName: "room info",
      // room: roomManager.getRoomInfo(socket.roomId),
      room: roomDict[roomId], // entire room object, too much data?
      mode: socket.spMode
    })
    socket.emit("recent messages", roomDict[roomId].messages)

    // remember user's choice of room
    // do not remember mode
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
              "Failed to remember mode/room " + httpResponse.statusCode
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
    const receiver = getUserFromRoom(receiverId, roomId)
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
    const receiver = getUserFromRoom(userIdToBeKicked, roomId)
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
    let messages = roomDict[roomId].messages
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
    roomDict[roomId].messages = messages
    io.in(roomId).emit("recent messages", messages)
    metrics.increment("delete message")
  })
  metrics.increment("connection")
})
