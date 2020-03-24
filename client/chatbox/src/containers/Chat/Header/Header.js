import "./Header.css"

// import { FormattedMessage, useIntl } from "react-intl"
import { useIntl } from "react-intl"
import React, { useState, useEffect } from "react"
import { Badge, Radio, Button, Tooltip, Icon } from "antd"
import { connect } from "react-redux"

import socketManager from "socket/socket"
import RoomHeader from "./RoomHeader"
import RoomInfo from "./RoomInfo"
import { setRoomConnectionStatus } from "redux/actions/chat"
function ChatHeader({
  chatModes,
  activeView,
  changeTab,
  changeChatView,
  viewOtherUser,
  rooms,
  account,
  setShowRoomList,
  setRoomConnectionStatus
}) {
  // const chatModes = props.chatModes
  // const activeView = props.activeView

  const intl = useIntl()
  const [showHelp, setShowHelp] = useState(false)
  const [unreads, setUnreads] = useState({})
  const [showUsers, toggleUsers] = useState(false)

  useEffect(() => {
    setShowHelp(false)
    setUnreads(unreads => {
      const res = { ...unreads }
      res[activeView] = 0
      return res
    })
    socketManager.addHandler("chat message", "mark_unread_chat", data => {
      const roomType = data.roomType
      if (roomType !== activeView) {
        setUnreads(unreads => {
          const res = { ...unreads }
          if (res[roomType]) {
            res[roomType]++
          } else {
            res[roomType] = 1
          }
          return res
        })
      }
    })
    return () => {
      socketManager.removeHandler("chat message", "mark_unread_chat")
    }
  }, [activeView])
  const getRoom = mode => {
    let room = rooms.filter(r => {
      return r.type === mode
    })
    if (room.length) {
      room = room[0]
    } else {
      room = null
    }
    return { ...room }
  }
  let content = (
    <center>
      <Button
        onClick={() => {
          changeTab("profile")
        }}
        size="small"
        type="primary"
      >
        {intl.formatMessage({ id: "login" })}
      </Button>
    </center>
  )
  if (account) {
    const room = getRoom(activeView)
    content = (
      <div>
        {showHelp && (
          <RoomInfo
            account={account}
            rooms={rooms}
            room={room}
            setShowHelp={setShowHelp}
          />
        )}
        {/* <Button
          style={{ border: "none", position: "absolute", left: 5 }}
          onClick={() => props.showMusic()}
          size="small"
          icon="unordered-list"
        >
          <span style={{ marginLeft: 5 }}>{props.mediaNum}</span>
        </Button> */}
        <span style={{ float: "left", marginLeft: 10 }}>
          <Radio.Group
            className="sp-toggle-page-site-chat"
            size="small"
            value={activeView}
            // buttonStyle="solid"
            onChange={e => {
              const chatView = e.target.value
              changeChatView(chatView)
            }}
          >
            {chatModes.map(mode => {
              const room = getRoom(mode)
              let roomTitle = ""
              let unreadCount = unreads[mode] || 0
              if (room) {
                if (mode === "room") {
                  roomTitle = room.name
                } else {
                  roomTitle = room.id
                }
              }
              return (
                <Tooltip key={mode} placement="bottom" title={roomTitle}>
                  <Radio.Button value={mode}>
                    {intl.formatMessage({ id: mode })}
                    <Badge offset={[3, -3]} count={unreadCount}></Badge>
                  </Radio.Button>
                </Tooltip>
              )
            })}
          </Radio.Group>
          <Button
            style={{ border: "none", boxShadow: "none" }}
            onClick={() => setShowHelp(true)}
            size="small"
            // icon="info-circle"
          >
            {/* <Icon type="info-circle" theme="twoTone" /> */}
            <Icon type="setting" />
          </Button>
        </span>
        {/* <Col style={{ textAlign: "right" }} span={8}> */}
        {chatModes.map((mode, i) => {
          const room = getRoom(mode)
          if (room) {
            return (
              <RoomHeader
                account={account}
                viewOtherUser={viewOtherUser}
                chatView={mode}
                show={mode === activeView}
                key={mode}
                room={room}
                showUsers={showUsers}
                toggleUsers={toggleUsers}
                setShowRoomList={setShowRoomList}
                setRoomConnectionStatus={setRoomConnectionStatus}
              />
            )
          } else {
            return <span key={mode} />
          }
        })}
      </div>
    )
  }
  return <div className="sp-tab-header">{content}</div>
}

// const stateToProps = state => {
//   return { chatView: state.chatView, chatModes: state.chatModes }
// }

// export default connect(null, { changeChatView, viewOtherUser })(
//   ChatHeader
// )
// export default ChatHeader
export default connect(null, { setRoomConnectionStatus })(ChatHeader)
