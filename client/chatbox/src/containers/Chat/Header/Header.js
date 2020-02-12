import "./Header.css"

// import { FormattedMessage, useIntl } from "react-intl"
import { useIntl } from "react-intl"
import { Badge } from "antd"
import React, { useState, useContext } from "react"
import { Radio, Button, Tooltip, Icon, Modal } from "antd"
// import { connect } from "react-redux"

import AccountContext from "context/account-context"
import UserButton from "./UserButton"
import { getUrl, getDomain } from "utils/url"
// import storageManager from "utils/storage"
// import spDebug from "config/logger"

function ChatHeader({
  chatModes,
  activeView,
  changeTab,
  changeChatView,
  viewOtherUser,
  manMadeRoom
}) {
  // const chatModes = props.chatModes
  // const activeView = props.activeView

  const intl = useIntl()
  const [showHelp, setShowHelp] = useState(false)
  const accountContext = useContext(AccountContext)

  // const chatView = props.chatView

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

  let content = (
    <center>
      <Button
        onClick={() => {
          changeTab("account")
        }}
        size="small"
        type="primary"
      >
        {intl.formatMessage({ id: "login" })}
      </Button>
    </center>
  )
  if (accountContext.account) {
    let helpTitle = ""
    let helpContent = ""
    // if (mode === "room") {
    //   helpTitle = room.name
    //   helpContent = (
    //     <div>
    //       <h4>介绍</h4>
    //       {room.about}
    //       <br />
    //       <br />
    //       <h4>房主</h4>
    //       {room.owner && (
    //         <div>
    //           <Avatar
    //             // icon={icon}
    //             // className={props.className}
    //             src={room.owner.avatarSrc}
    //             size="large"
    //             style={{ cursor: "pointer", marginRight: 10 }}
    //             onClick={() => {
    //               setShowHelp(false)
    //               props.viewOtherUser(room.owner)
    //             }}
    //           />
    //           {room.owner.name}
    //         </div>
    //       )}
    //     </div>
    //   )
    // }
    // if (mode === "site") {
    //   helpTitle = "同网站聊天"
    //   helpContent = (
    //     <div>
    //       <h4>介绍</h4>
    //       和其他也在{getDomain()}的用户聊天。
    //     </div>
    //   )
    // }
    // if (mode === "page") {
    //   helpTitle = "同网页聊天"
    //   helpContent = (
    //     <div>
    //       <h4>介绍</h4>
    //       和其他也在{getUrl()}的用户聊天。
    //     </div>
    //   )
    // }
    // if (mode === "tags") {
    //   helpTitle = intl.formatMessage({ id: "room" }) + " " + room.id
    //   helpContent = (
    //     <div>
    //       {/* <p>浏览相似内容的用户会进入该聊天室</p> */}
    //       <p>{intl.formatMessage({ id: "keywords.of.room" })}</p>
    //       <b>{room.tags && room.tags.join(", ")}</b>
    //       {(!room.tags || !room.tags.length) && (
    //         <span>{intl.formatMessage({ id: "no.keyword" })}</span>
    //       )}
    //     </div>
    //   )
    // }
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
            // if (mode === "room") {
            // }
          }}
        >
          {chatModes.includes("room") && (
            <Tooltip placement="bottom" title={manMadeRoom && manMadeRoom.name}>
              <Radio.Button value="room">
                房间<Badge offset={[3, -3]} count={0}></Badge>
              </Radio.Button>
            </Tooltip>
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
        {chatModes.map((mode, i) => (
          <UserButton
            viewOtherUser={viewOtherUser}
            chatView={mode}
            show={mode === activeView}
            key={mode}
          />
        ))}
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
