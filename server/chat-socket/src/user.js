"use strict"

const request = require("request")
const urls = require("./cfg/urls")
const metrics = require("./metrics")

function getUserDataFromDB(token, callback) {
  const headers = { token: token }
  request.get(
    { url: urls.dbAPI + "/api/v1/user", json: true, headers: headers },
    function optionalCallback(err, httpResponse, body) {
      if (err || httpResponse.statusCode != 200) {
        if (err) console.error("DB get user request failed", err)
        else
          console.error("DB get user request failed", httpResponse.statusCode)

        callback(null)
        return
      }
      var user = body
      callback(user)
    }
  )
}

var userManager = {
  loginUser: function(socket, callback) {
    if (socket.isVisitor) {
      socket.user = {
        // Each visitor should have a different id (fast n dirty solution)
        id: -Math.floor(Math.random() * 1000),
        name: "visitor",
        mode: "site"
      }
      callback(true)
      return
    }
    // 401: token not found or problem checking token
    // 400: credit too low

    getUserDataFromDB(socket.token, function(user) {
      var allowJoin = false
      if (user) {
        socket.user = user
        // delete socket.hasAvatar once all clients on v4.0.6
        socket.hasAvatar = user.avatarSrc
        if (user.credit >= 0) {
          allowJoin = true
        } else {
          metrics.increment("login.forbidden")
          socket.emit("alert", { errorCode: 403 })
        }
      } else {
        socket.emit("alert", { errorCode: 401 })
      }
      callback(allowJoin)
    })
  }
}

module.exports = userManager
