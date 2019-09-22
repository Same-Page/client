const request = require("request")
const urls = require("./cfg/urls")

let _sitesToRooms = {}
let _roomsInfo = {}
const roomManager = {
  getRoomInfo: roomId => {
    return _roomsInfo[roomId]
  },
  loadRooms: () => {
    console.log("load rooms")
    request.get(
      {
        url: urls.dbAPI + "/api/v1/rooms"
      },
      function optionalCallback(err, httpResponse, body) {
        if (err) {
          console.error("Failed to load rooms", err)
          return
        }
        if (httpResponse.statusCode === 200) {
          rooms = JSON.parse(body)
          rooms.forEach(r => {
            _roomsInfo[r.id] = r
          })
        }
      }
    )
  },
  getRooms: (token, cb) => {
    request.get(
      {
        url: urls.dbAPI + "/api/v1/rooms",
        headers: {
          token: token
        }
      },
      function optionalCallback(err, httpResponse, body) {
        if (err) {
          console.error("Failed to get rooms", err)
          socket.emit("alert", { errorCode: 500 })
          cb(false)
          return
        }
        if (httpResponse.statusCode === 200) {
          rooms = JSON.parse(body)
          cb(rooms)
          rooms.forEach(r => {
            _roomsInfo[r.id] = r
          })
        } else {
          cb(false)
        }
      }
    )
  },

  siteToRoom: site => {
    return _sitesToRooms[site]
  },

  setSiteToRoom: res => {
    console.log("set site to room")
    res = res || { send: () => {} }
    request.get(
      {
        url: urls.dbAPI + "/api/v1/site_to_rooms"
      },
      function optionalCallback(err, httpResponse, body) {
        if (err) {
          console.error("Failed to get site to rooms mapping", err)
          res.send(500)
          return
        }
        if (httpResponse.statusCode === 200) {
          _sitesToRooms = JSON.parse(body)
          res.send(httpResponse.statusCode)
        } else {
          res.send(httpResponse.statusCode)
        }
      }
    )
  },

  getRecommendedRooms: () => {
    return [
      {
        roomId: "lobby",
        title: "聊天大厅",
        url: "https://yiyechat.com",
        userCount: 0
      },
      {
        roomId: "www.baidu.com",
        title: "百度",
        url: "https://www.baidu.com",
        userCount: 0
      },
      {
        roomId: "www.google.com",
        title: "Google",
        url: "https://www.google.com",
        userCount: 0
      },
      {
        roomId: "www.bilibili.com",
        title: "Bilibili",
        url: "https://www.bilibili.com/",
        userCount: 0
      },
      {
        roomId: "www.youtube.com",
        title: "Youtube",
        url: "https://youtube.com",
        userCount: 0
      },
      {
        roomId: "www.douban.com",
        title: "豆瓣",
        url: "https://www.douban.com",
        userCount: 0
      },
      {
        roomId: "github.com",
        title: "Github",
        url: "https://github.com",
        userCount: 0
      },
      {
        roomId: "www.zhihu.com",
        title: "知乎",
        url: "https://www.zhihu.com",
        userCount: 0
      },
      {
        roomId: "jandan.net",
        title: "煎蛋",
        url: "https://jandan.net",
        userCount: 0
      }
    ]
  }
}

module.exports = roomManager
