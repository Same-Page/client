import "./Header.css"

// import { FormattedMessage, useIntl } from "react-intl"
import { useIntl } from "react-intl"
import React, { useState, useEffect } from "react"
import { Badge, Radio, Button, Tooltip, Icon } from "antd"
import socketManager from "socket/socket"
import UserButton from "./UserButton"
import RoomInfo from "./RoomInfo"

function ChatHeader({
  chatModes,
  activeView,
  changeTab,
  changeChatView,
  viewOtherUser,
  rooms,
  account,
  setRoomConnectionStatus
}) {
  // const chatModes = props.chatModes
  // const activeView = props.activeView

  const intl = useIntl()
  const [showHelp, setShowHelp] = useState(false)
  const [unreads, setUnreads] = useState({})
  const [showUsers, toggleUsers] = useState(false)

  useEffect(() => {
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
    return room
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
    const connected = room && room.connected
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
        {connected && (
          <Button
            style={{
              color: "red",
              border: "none",
              position: "absolute",
              left: 5
            }}
            onClick={() => {
              console.log("leave" + room.id)
              setRoomConnectionStatus(room.id, false)
              socketManager.leaveRoom(room.id, rooms, account.token)
            }}
            size="small"
            // icon="info-circle"
          >
            {/* <Icon type="info-circle" theme="twoTone" /> */}
            <Icon type="poweroff" />
          </Button>
        )}
        {/* <Button
          style={{ border: "none", position: "absolute", left: 5 }}
          onClick={() => props.showMusic()}
          size="small"
          icon="unordered-list"
        >
          <span style={{ marginLeft: 5 }}>{props.mediaNum}</span>
        </Button> */}
        <Radio.Group
          className="sp-toggle-page-site-chat"
          size="small"
          value={activeView}
          buttonStyle="solid"
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
        {/* <div style={{ maxWidth: "45%", display: "inline-flex" }}>
          <span
            style={{
              whiteSpace: "nowrap",
              textOverflow: "ellipsis",
              overflow: "hidden"
            }}
          >
            {room.tags && room.tags.join(", ")}
            {(!room.tags || !room.tags.length) && (
              <FormattedMessage id="no.keyword"></FormattedMessage>
            )}
          </span>
        </div> */}
        <Button
          style={{ border: "none" }}
          onClick={() => setShowHelp(true)}
          size="small"
          // icon="info-circle"
        >
          {/* <Icon type="info-circle" theme="twoTone" /> */}
          <Icon type="setting" theme="twoTone" />
        </Button>
        {/* <Col style={{ textAlign: "right" }} span={8}> */}
        {chatModes.map((mode, i) => {
          const room = getRoom(mode)
          if (room) {
            const connected = room.connected

            return (
              <UserButton
                viewOtherUser={viewOtherUser}
                chatView={mode}
                show={mode === activeView}
                key={mode}
                room={room}
                connected={connected}
                showUsers={showUsers}
                toggleUsers={toggleUsers}
              />
            )
          } else {
            return <span key={mode} />
          }
        })}
      </div>
    )
  }
  return <center className="sp-tab-header">{content}</center>
}

// const stateToProps = state => {
//   return { chatView: state.chatView, chatModes: state.chatModes }
// }

// export default connect(null, { changeChatView, viewOtherUser })(
//   ChatHeader
// )
export default ChatHeader
