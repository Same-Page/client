"use strict"

const request = require("request")
const urls = require("./cfg/urls")

const INVITATION_TYPE = {
  FOLLOWER: "follower",
  ROOM: "room",
  ALL: "all"
}

function _invite(socketIds, socketIO, payload) {
  socketIds = socketIds || {}
  Object.keys(socketIds).forEach(sid => {
    const s = socketIO.sockets.sockets[sid]
    if (s) {
      s.emit("*", payload)
      s.invitation = payload
    }
  })
}

var invitationManager = {
  sendInvitation: function(socket, invitationPayload, socketIO, messageId) {
    // check frequency
    // check credit
    // deduct credit
    // send invites to sockets
    // return message (point cost or failure msg)

    request.post(
      {
        url: urls.dbAPI + "/api/v1/invite",
        json: invitationPayload,
        headers: {
          token: socket.token
        }
      },
      function optionalCallback(err, httpResponse, body) {
        if (err) {
          console.error("invitation failed", err)
          socket.emit("alert", { errorCode: 500 })
          return
        }
        if (httpResponse.statusCode === 200) {
          let receiverCount = null
          const metadata = {
            type: invitationPayload.invitationType,
            purpose: invitationPayload.invitationPurpose,
            pageTitle: invitationPayload.title,
            pageUrl: invitationPayload.url
          }
          const payload = {
            id: messageId,
            eventName: "invitation",
            content: "邀请了你",
            type: invitationPayload.type,
            userId: socket.userId,
            user: socket.user,
            metadata: metadata
          }
          if (invitationPayload.invitationType === INVITATION_TYPE.ROOM) {
            const sids = socketIO.sockets.adapter.rooms[socket.roomId].sockets
            _invite(sids, socketIO, payload)
          } else if (invitationPayload.invitationType === INVITATION_TYPE.ALL) {
            // this is socket count not users
            receiverCount = Object.keys(socketIO.sockets.sockets).length
            _invite(socketIO.sockets.sockets, socketIO, payload)
          } else {
            var followers = {}
            body.followers.forEach(function(follower) {
              followers[follower["id"]] = true
            })
            var onlineFollowers = {}
            Object.keys(socketIO.sockets.sockets).forEach(function(sid) {
              const follower = socketIO.sockets.sockets[sid]
              if (follower && follower.userId in followers) {
                follower.emit("*", payload)
                follower.invitation = payload
                onlineFollowers[follower.userId] = true
              }
            })
            receiverCount = Object.keys(onlineFollowers).length
          }
          if (
            invitationPayload.invitationType === INVITATION_TYPE.FOLLOWER ||
            invitationPayload.invitationType === INVITATION_TYPE.ALL
          )
            socket.emit("*", {
              eventName: "invitation sent",
              receiverCount: receiverCount
            })
        } else {
          socket.emit("alert", { errorCode: httpResponse.statusCode })
        }
      }
    )
  }
}

module.exports = invitationManager
