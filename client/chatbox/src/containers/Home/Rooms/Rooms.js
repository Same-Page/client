import "./Room.css"

import React from "react"
import { Icon } from "antd"
import { connect } from "react-redux"

import { joinManMadeRoom } from "redux/actions/chat"
import socketManager from "socket"

function Rooms({
  loading,
  rooms,
  joinManMadeRoom,
  manMadeRoom,
  setShowRoomList
}) {
  if (loading)
    return (
      <center>
        <Icon type="loading" />
      </center>
    )
  return rooms.map(room => {
    let roomId = room.id
    return (
      // <Tooltip
      //   key={roomId}
      //   // overlayStyle={{ maxWidth: 100 }}
      //   title={room.about}
      //   placement="right"
      // >
      <div
        key={roomId}
        title={room.about}
        className="sp-home-chatroom"
        onClick={() => {
          joinManMadeRoom(room)
          setShowRoomList(false)
          if (manMadeRoom) {
            socketManager.leaveRoom(manMadeRoom)
          }
          socketManager.joinRoom(room)
        }}
      >
        <span style={{ marginRight: 15, display: "inline-block", width: 25 }}>
          <Icon type="user" />
          {room.userCount}
        </span>
        {room.name}
      </div>
      // </Tooltip>
    )
  })
}

const stateToProps = state => {
  return { manMadeRoom: state.manMadeRoom }
}

export default connect(stateToProps, { joinManMadeRoom })(Rooms)
