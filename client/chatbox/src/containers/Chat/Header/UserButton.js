import React, { useState, useEffect } from "react"
import { Button } from "antd"

import Users from "./Users"
import socketManager from "socket/socket"
import { getUrl, getDomain } from "utils/url"

function UserButton({ chatView, show, roomId, viewOtherUser }) {
  const [showUsers, toggleUsers] = useState(false)
  const [users, setUsers] = useState([])
  roomId = roomId || "lobby"
  if (chatView === "page") {
    roomId = getUrl()
  }
  if (chatView === "site") {
    roomId = getDomain()
  }
  let userNum = users.length
  if (userNum >= 50) {
    userNum = "50+"
  }
  const suffixCb = handlerName => {
    return handlerName + "_" + roomId.toString()
  }
  useEffect(() => {
    // No storage listener because user may chat in
    // different chat rooms
    // TODO: remove listener on unmount
    // storageManager.addEventListener("mode", mode => {
    //   mode = mode || DEFAULT_MODE
    //   setMode(mode)
    //   const newRoom
    //   if (mode == 'site') {
    //   }
    //   socketManager.changeRoom(roomId)
    // })
    socketManager.sendEvent({
      action: "room",
      data: {
        rooms: [roomId]
      }
    })
    // console.log("register user join/left handlers")
    socketManager.addHandler(
      "other join",
      suffixCb("add_user_to_room"),
      data => {
        setUsers(users => {
          // TODO: dedup NO, server should handle
          return [...users, data.user]
        })
      }
    )
    socketManager.addHandler(
      "other left",
      suffixCb("remove_user_from_room"),
      data => {
        setUsers(users => {
          return users.filter(u => {
            return u.id.toString() !== data.user.id.toString()
          })
        })
      }
    )
    socketManager.addHandler(
      "room info",
      suffixCb("set_users_in_room"),
      roomDict => {
        if (roomId in roomDict) {
          const roomData = roomDict[roomId]
          setUsers(roomData.users)
        }
      }
    )
    socketManager.addHandler(
      "disconnect",
      suffixCb("clear_users_in_room"),
      () => {
        setUsers([])
      }
    )
    // socketManager.addHandler("room info", "set_mode_and_room", data => {
    //   // useful when user join a popular site, but
    //   // backend move user into certain room
    //   // E.g. www.google.com -> lobby
    //   // Note: should only update UI, do not trigger actual room change!
    //   // console.log(data)
    //   chatContext.setMode(data.mode)
    //   if (data.mode === "room") {
    //     chatContext.setRoom(data.room)
    //     chatContext.setRealRoom(data.room)
    //   }
    //   if (data.mode === "tags") {
    //     spDebug(data)
    //     chatContext.setRoom(data.room)
    //     chatContext.setRealRoom(data.room)
    //   }
    // })
    // window.setMode = setMode
    return () => {
      // No clean up because chat header is never unmounted after mounted
      console.error("[Headerjs] this cleanup should never run")
      socketManager.removeHandler("other join", suffixCb("add_user_to_room"))
      socketManager.removeHandler(
        "other left",
        suffixCb("remove_user_from_room")
      )
      socketManager.removeHandler("room info", suffixCb("set_users_in_room"))
      // socketManager.removeHandler("room info", "set_mode_and_room")
      socketManager.removeHandler("disconnect", suffixCb("clear_users_in_room"))
      // window.setMode = null
    }
  }, [])
  if (show) {
    return (
      <span>
        <Button
          style={{ border: "none", position: "absolute", right: 0 }}
          onClick={() => toggleUsers(!showUsers)}
          size="small"
          icon="team"
        >
          <span style={{ marginLeft: 5 }}>{userNum}</span>
        </Button>
        {showUsers && <Users viewOtherUser={viewOtherUser} users={users} />}
      </span>
    )
  }
  return <span />
}

export default UserButton
