import React, { useState, useEffect } from "react"
import { Button, Icon, message } from "antd"
import { connect } from "react-redux"
import { useIntl } from "react-intl"

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
  const connected = room.connectionStatus === "CONNECTED"
  const [users, setUsers] = useState([])
  const intl = useIntl()

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
              setRoomConnectionStatus(roomId, "CONNECTED")
              // message.success(
              //   intl.formatMessage({ id: room.type }) +
              //     " " +
              //     intl.formatMessage({ id: "connected" }),
              //   2
              // )
              // console.log("setRoomConnectionStatus " + roomId)
            } else {
              setRoomConnectionStatus(roomId, "DISCONNECTED")
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
      <span
        style={{
          float: "right",
          marginRight: 10
          // position: "absolute",
          // right: 0
        }}
      >
        {/* {chatView === "room" && (
          <Button
            style={
              {
                // border: "none",
                // boxShadow: "none"
                // position: "absolute",
                // left: 5
              }
            }
            onClick={() =>
              setShowRoomList(srl => {
                return !srl
              })
            }
            size="small"
            icon="menu"
          ></Button>
        )} */}

        {connected && (
          <span
            style={
              {
                // position: "absolute",
                // right: 5
              }
            }
          >
            <Button
              style={
                {
                  // border: "none",
                  // boxShadow: "none"
                  // position: "absolute",
                  // right: 0
                }
              }
              onClick={() => toggleUsers(!showUsers)}
              size="small"
              icon="team"
            >
              {/* fix width so buttons don't shift when user number 
              is different in different room */}
              <span style={{ marginLeft: 3, width: 20 }}>{userNum}</span>
            </Button>
            <Button
              style={
                {
                  // color: "red",
                  // border: "none",
                  // boxShadow: "none"
                  // position: "absolute",
                  // right: 20
                }
              }
              onClick={() => {
                window.spDebug("leave" + room.id)
                setRoomConnectionStatus(room.id, "DISCONNECTED")
                socketManager.leaveRoom(room)
                setUsers([])
              }}
              size="small"
              icon="logout"
            >
              {/* <Icon type="info-circle" theme="twoTone" /> */}
              {/* <Icon type="logout" /> */}
            </Button>
            {showUsers && <Users viewOtherUser={viewOtherUser} users={users} />}
          </span>
        )}
      </span>
    )
  }

  return <span />
}

// export default RoomHeader
export default connect(null, { setRoomConnectionStatus })(RoomHeader)
