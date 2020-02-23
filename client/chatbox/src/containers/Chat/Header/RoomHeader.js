import React, { useState, useEffect } from "react"
import { Button, Icon } from "antd"
import { connect } from "react-redux"
import Users from "./Users"
import socketManager from "socket/socket"
import { setRoomConnectionStatus } from "redux/actions/chat"

function RoomHeader({
  account,
  chatView,
  show,
  room,
  viewOtherUser,
  setRoomConnectionStatus,
  toggleUsers,
  showUsers,
  setShowRoomList
}) {
  // console.log(room)
  const connected = room.connected
  const [users, setUsers] = useState([])

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
          const room = roomDict[roomId]
          if (room.users) {
            setUsers(room.users)
            // make sure user himself is in the response
            // sometimes user isn't added to room properly
            const userInRoom = room.users.filter(u => {
              return u.id === account.id
            })
            if (userInRoom.length > 0) {
              setRoomConnectionStatus(roomId, true)
              // console.log("setRoomConnectionStatus " + roomId)
            } else {
              setRoomConnectionStatus(roomId, false)
              console.error("User not added to room properly! ")
            }
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

  if (show) {
    return (
      <span>
        {chatView === "room" && (
          <Button
            style={{ border: "none" }}
            onClick={() =>
              setShowRoomList(srl => {
                return !srl
              })
            }
            size="small"
            icon="menu"
          ></Button>
        )}
        {connected && (
          <span>
            <Button
              style={{
                color: "red",
                border: "none",
                position: "absolute",
                left: 5
              }}
              onClick={() => {
                window.spDebug("leave" + room.id)
                setRoomConnectionStatus(room.id, false)
                socketManager.leaveRoom(room)
                setUsers([])
              }}
              size="small"
              // icon="info-circle"
            >
              {/* <Icon type="info-circle" theme="twoTone" /> */}
              <Icon type="poweroff" />
            </Button>

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
        )}
      </span>
    )
  }

  return <span />
}

export default connect(null, { setRoomConnectionStatus })(RoomHeader)
