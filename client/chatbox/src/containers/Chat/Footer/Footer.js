import "./Footer.css"

import React, { useState, useEffect } from "react"
import { message, Button, Modal, Tooltip } from "antd"
import { useIntl } from "react-intl"
import { connect } from "react-redux"
import moment from "moment"

import InputWithPicker from "components/InputWithPicker"
import socketManager from "socket/socket"
import { getUrl } from "utils/url"

const MESSAGE_TIME_GAP = 2 * 1000
let lastMsgTime = 0
function Footer({ account, setMessages, chatView, room, connected }) {
  const roomId = room.id
  const intl = useIntl()
  const [joining, setJoining] = useState(false)
  const [showInvitationModal, setShowInvitationModal] = useState(false)
  useEffect(() => {
    if (connected) {
      setJoining(false)
    }
  }, [connected])
  // const roomId = room.id
  // const connected = room.connected
  window.spDebug("[Footer.js] connected " + connected)
  // const [invitationType, setInvitationType] = useState("room")
  // const [invitationPurpose, setInvitationPurpose] = useState("chat")

  const send = payload => {
    const now = new Date()
    if (payload.type === "file" || now - lastMsgTime > MESSAGE_TIME_GAP) {
      lastMsgTime = now

      const data = {
        id: Math.ceil(Math.random() * 100000),
        token: account.token,
        roomType: chatView,
        roomId: roomId,
        content: payload
      }
      socketManager.sendMessage(data)
      // convert message to be same format as from server
      if (payload.type === "text") {
        data.content = {
          value: payload.text,
          type: payload.type
        }

        data.time = moment()
        data.user = account
        data.self = true
        // TODO: add timeout for server confirmation
        // if no confirmation then show error
        setMessages(prevMessages => {
          return [...prevMessages, data]
        })
      }
      return true
    } else {
      message.warn(intl.formatMessage({ id: "slow.down" }))
      return false
    }
  }

  let content = (
    <InputWithPicker
      send={send}
      addonAfter={
        chatView !== "page" && (
          <span>
            <Modal
              title={intl.formatMessage({ id: "share.url" })}
              visible={showInvitationModal}
              onOk={() => {
                const payload = {
                  // url and title added by content script
                  type: "url",
                  url: getUrl()
                  // invitationType: invitationType,
                  // invitationPurpose: invitationPurpose
                }
                send(payload)
                // socketManager.sendMessage(payload)
                setShowInvitationModal(false)
                // if (invitationType !== "room") {
                //   // room invitation is much faster
                //   // no db lookup
                //   message.loading("发送中")
                // }
              }}
              onCancel={() => {
                setShowInvitationModal(false)
              }}
              okText={intl.formatMessage({ id: "yes" })}
              cancelText={intl.formatMessage({ id: "cancel" })}
            >
              <p>{intl.formatMessage({ id: "share.url.privacy" })}</p>
              {/* <b style={{ marginRight: 10 }}>邀请目的</b>
              <Radio.Group
                onChange={e => {
                  setInvitationPurpose(e.target.value)
                }}
                value={invitationPurpose}
              >
                <Radio value="chat">聊天</Radio>
                <Radio value="help">求助</Radio>
              </Radio.Group>
              <br />
              <br />
              <div style={{ display: "flex" }}>
                <b style={{ marginRight: 10 }}>邀请对象</b>
                <Radio.Group
                  onChange={e => {
                    setInvitationType(e.target.value)
                  }}
                  value={invitationType}
                >
                  <Radio style={{ display: "block" }} value="room">
                    当前房间的用户
                  </Radio>
                  <Radio disabled style={{ display: "block" }} value="follower">
                    关注者
                  </Radio>
                  <Radio disabled style={{ display: "block" }} value="all">
                    全站用户（需20积分）
                  </Radio>
                </Radio.Group> 
              </div>*/}
            </Modal>
            <Tooltip
              title={intl.formatMessage({ id: "share.url" })}
              placement="left"
            >
              <Button
                onClick={() => {
                  setShowInvitationModal(true)
                }}
                icon="share-alt"
              />
            </Tooltip>
          </span>
        )
      }
    />
  )

  if (!connected) {
    content = (
      <center
        style={{
          padding: 20,
          background: "white",
          borderTop: "lightgray 1px solid"
        }}
      >
        <Button
          style={{ width: "100%" }}
          onClick={() => {
            socketManager.joinRoom(room)
            setJoining(true)
          }}
          loading={joining}
          type="primary"
          size="large"
        >
          {intl.formatMessage({ id: "join.room" })}
        </Button>
      </center>
    )
  }

  if (!account) {
    content = (
      <center style={{ padding: 20, background: "lightgray" }}>
        {intl.formatMessage({ id: "not.login" })}
      </center>
    )
  }

  return <div className="sp-chat-bottom">{content}</div>
}
export default Footer
// const stateToProps = (state, props) => {
//   let roomId = "lobby"
//   if (state.chatView == "page") {
//     roomId = getUrl()
//   }
//   if (state.chatView == "site") {
//     roomId = getDomain()
//   }
//   return {
//     roomId: roomId
//   }
// }
// export default connect(null, { setRoomConnectionStatus })(Footer)
