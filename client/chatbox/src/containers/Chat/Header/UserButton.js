import React, { useState, useEffect } from "react"
import { Button } from "antd"
import { connect } from "react-redux"
import Users from "./Users"
import socketManager from "socket/socket"
import { setRoomConnectionStatus } from "redux/actions/chat"
// import { getUrl, getDomain } from "utils/url"

function UserButton({
  chatView,
  show,
  room,
  viewOtherUser,
  setRoomConnectionStatus,
  connected,
  toggleUsers,
  showUsers
}) {
  const [users, setUsers] = useState([])
  // const connected = room.connected
  let roomId = room.id
  let userNum = users.length
  // if (userNum >= 50) {
  //   userNum = "50+"
  // }
  const suffixCb = handlerName => {
    return handlerName + "_" + roomId.toString()
  }
  useEffect(() => {
    if (!roomId) return

    // console.log("register user join/left handlers " + roomId)
    socketManager.addHandler(
      "other join",
      suffixCb("add_user_to_room"),
      data => {
        if (data.roomId === roomId) {
          setUsers(users => {
            const user = data.user
            const existingUsersWithoutNewUser = users.filter(u => {
              return u.id.toString() !== user.id.toString()
            })
            return [...existingUsersWithoutNewUser, user]
          })
        }
      }
    )
    socketManager.addHandler(
      "other left",
      suffixCb("remove_user_from_room"),
      data => {
        if (data.roomId === roomId) {
          setUsers(users => {
            return users.filter(u => {
              return u.id.toString() !== data.user.id.toString()
            })
          })
        }
      }
    )
    socketManager.addHandler(
      "room info",
      suffixCb("set_users_in_room"),
      roomDict => {
        if (roomId in roomDict) {
          // console.log("set connected")
          setRoomConnectionStatus(roomId, true)
          const room = roomDict[roomId]
          if (room.users) {
            setUsers(room.users)
          }
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
      socketManager.removeHandler("other join", suffixCb("add_user_to_room"))
      socketManager.removeHandler(
        "other left",
        suffixCb("remove_user_from_room")
      )
      socketManager.removeHandler("room info", suffixCb("set_users_in_room"))
      socketManager.removeHandler("disconnect", suffixCb("clear_users_in_room"))
    }
  }, [roomId])
  // console.log(room)

  if (show && connected) {
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

export default connect(null, { setRoomConnectionStatus })(UserButton)
