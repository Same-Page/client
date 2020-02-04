import "./Header.css"

import { FormattedMessage, useIntl } from "react-intl"
import { Badge } from "antd"
import React, { useState, useEffect, useContext } from "react"
import { Radio, Button, Tooltip, Icon, Modal, Avatar } from "antd"
import { connect } from "react-redux"

import socketManager from "socket/socket"
import Users from "./Users"
import AccountContext from "context/account-context"
import TabContext from "context/tab-context"
import { getUrl, getDomain } from "utils/url"
import storageManager from "utils/storage"
import spDebug from "config/logger"

import { changeChatView } from "redux/actions/chat"

function ChatHeader(props) {
  const chatModes = window.spConfig.chatModes || ["room", "site", "page"]
  const intl = useIntl()
  const [showUsers, toggleUsers] = useState(false)
  const [showHelp, setShowHelp] = useState(false)
  const [users, setUsers] = useState([])
  const accountContext = useContext(AccountContext)
  const tabContext = useContext(TabContext)
  const mode = props.mode
  const room = {} // TODO
  // const room = chatContext.room || {}
  // site and page also rooms, realRoom means
  // non site and page room id
  // useEffect(() => {
  //   // setUsers([])
  //   if (room && mode) {
  //     socketManager.changeRoom(room.id, mode)
  //   }
  //   // console.log("room changed")
  // }, [room, mode])
  // useEffect(() => {
  //   if (mode === "site") {
  //     const room = {
  //       title: getDomain(),
  //       id: getDomain()
  //     }
  //     chatContext.setRoom(room)
  //   }
  //   if (mode === "page") {
  //     const room = {
  //       title: getUrl(),
  //       id: getUrl()
  //     }
  //     chatContext.setRoom(room)
  //   }
  //   // if mode is room, Rooms.js will set room

  //   // console.log("mode change")
  //   storageManager.set("mode", mode)
  // }, [mode])

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

    // console.log("register user join/left handlers")
    socketManager.addHandler("new user", "add_user_to_room", user => {
      setUsers(users => {
        // TODO: dedup
        return [...users, user]
      })
    })
    socketManager.addHandler("user gone", "remove_user_from_room", user => {
      setUsers(users => {
        return users.filter(u => {
          return u.id.toString() !== user.id.toString()
        })
      })
    })
    socketManager.addHandler("users in room", "set_users_in_room", users => {
      // console.log(users)
      setUsers(users)
    })
    socketManager.addHandler("disconnect", "clear_users_in_room", () => {
      setUsers([])
    })
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
      socketManager.removeHandler("new user", "add_user_to_room")
      socketManager.removeHandler("user gone", "remove_user_from_room")
      socketManager.removeHandler("users in room", "set_users_in_room")
      // socketManager.removeHandler("room info", "set_mode_and_room")
      socketManager.removeHandler("disconnect", "clear_users_in_room")
      // window.setMode = null
    }
  }, [])

  let content = (
    <center>
      <Button
        onClick={() => {
          tabContext.changeTab("account")
        }}
        size="small"
        type="primary"
      >
        {intl.formatMessage({ id: "login" })}
      </Button>
    </center>
  )
  if (accountContext.account) {
    let userNum = users.length
    if (userNum >= 50) {
      userNum = "50+"
    }
    let helpTitle = ""
    let helpContent = ""
    if (mode === "room") {
      helpTitle = room.name
      helpContent = (
        <div>
          <h4>介绍</h4>
          {room.about}
          <br />
          <br />
          <h4>房主</h4>
          {room.owner && (
            <div>
              <Avatar
                // icon={icon}
                // className={props.className}
                src={room.owner.avatarSrc}
                size="large"
                style={{ cursor: "pointer", marginRight: 10 }}
                onClick={() => {
                  setShowHelp(false)
                  tabContext.selectOtherUser(room.owner)
                }}
              />
              {room.owner.name}
            </div>
          )}
        </div>
      )
    }
    if (mode === "site") {
      helpTitle = "同网站聊天"
      helpContent = (
        <div>
          <h4>介绍</h4>
          和其他也在{getDomain()}的用户聊天。
        </div>
      )
    }
    if (mode === "page") {
      helpTitle = "同网页聊天"
      helpContent = (
        <div>
          <h4>介绍</h4>
          和其他也在{getUrl()}的用户聊天。
        </div>
      )
    }
    if (mode === "tags") {
      helpTitle = intl.formatMessage({ id: "room" }) + " " + room.id
      helpContent = (
        <div>
          {/* <p>浏览相似内容的用户会进入该聊天室</p> */}
          <p>{intl.formatMessage({ id: "keywords.of.room" })}</p>
          <b>{room.tags && room.tags.join(", ")}</b>
          {(!room.tags || !room.tags.length) && (
            <span>{intl.formatMessage({ id: "no.keyword" })}</span>
          )}
        </div>
      )
    }
    content = (
      <div>
        {/* <Switch
        className="sp-toggle-online"
        checkedChildren="在线"
        unCheckedChildren="离线"
        defaultChecked
        onChange={toggleOnline}
      /> */}
        <Modal
          title={helpTitle}
          visible={showHelp}
          onCancel={() => {
            setShowHelp(false)
          }}
          wrapClassName="sp-modal"
          footer={null}
          bodyStyle={{ maxHeight: "calc(100% - 55px)", overflowY: "auto" }}
        >
          {helpContent}
          <a
            className="yiyelink"
            target="_blank"
            rel="noopener noreferrer"
            href="https://yiyechat.com"
          >
            {intl.formatMessage({ id: "sp" })}
          </a>
        </Modal>

        <Button
          style={{ border: "none", position: "absolute", left: 5 }}
          onClick={() => props.showMusic()}
          size="small"
          icon="unordered-list"
        >
          {/* <span style={{ marginLeft: 5 }}>{props.mediaNum}</span> */}
        </Button>
        <Radio.Group
          className="sp-toggle-page-site-chat"
          size="small"
          value={mode}
          buttonStyle="solid"
          onChange={e => {
            const mode = e.target.value
            props.changeChatView(mode)
            if (mode === "room") {
            }
          }}
        >
          {chatModes.includes("room") && (
            // <Tooltip placement="bottom" title={chatContext.realRoom.name}>
            <Radio.Button value="room">
              房间<Badge offset={[3, -3]} count={0}></Badge>
            </Radio.Button>
            // </Tooltip>
          )}
          {chatModes.includes("site") && (
            <Tooltip placement="bottom" title={getDomain()}>
              <Radio.Button value="site">网站</Radio.Button>
            </Tooltip>
          )}
          {chatModes.includes("page") && (
            <Tooltip placement="bottom" title={getUrl()}>
              <Radio.Button value="page">网页</Radio.Button>
            </Tooltip>
          )}
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

        <Button
          style={{ border: "none", position: "absolute", right: 0 }}
          onClick={() => toggleUsers(!showUsers)}
          size="small"
          icon="team"
        >
          <span style={{ marginLeft: 5 }}>{userNum}</span>
        </Button>
        {showUsers && <Users users={users} />}
      </div>
    )
  }
  return <center className="sp-tab-header">{content}</center>
}

const stateToProps = state => {
  return { mode: state.mode }
}

export default connect(stateToProps, { changeChatView })(ChatHeader)
