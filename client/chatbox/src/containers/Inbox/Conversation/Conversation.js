import "./Conversation.css"

import React, { useContext, useState, useRef, useEffect } from "react"
import { Button } from "antd"
import moment from "moment"

import socketManager from "socket"
import Message from "containers/Chat/Message"
import { postMessage } from "services/message"
import AccountContext from "context/account-context"
import TabContext from "context/tab-context"
import InputWithPicker from "components/InputWithPicker"

const conversationBodyStyle = {
  height: "calc(100% - 107px)",
  overflow: "auto",
  width: "100%",
  position: "fixed",
  background: "#f6f9fc",
  padding: 10,
  paddingBottom: 50
}

const AUTO_SCROLL_TRESHOLD_DISTANCE = 500

function Conversation(props) {
  const account = useContext(AccountContext).account
  const tabContext = useContext(TabContext)
  const messages = props.conversation.messages
  const other = props.conversation.user
  const offset = props.offset
  const [sending, setSending] = useState(false)
  const bodyRef = useRef()

  let lastMsg = null
  const body = messages.map(msg => {
    msg.time = moment.utc(msg.created)

    if (msg.self) {
      msg.user = account
      msg.userId = account.id
    } else {
      msg.user = other
      msg.userId = other.id
    }
    // If same user is talking, no need to show user's avatar again
    let showUser = true
    // If it's been more than 5 mins since last msg
    let showTimestamp = false
    let timeDisplay = null

    if (lastMsg) {
      if (lastMsg.userId.toString() === msg.userId.toString()) showUser = false
      if (msg.time.diff(lastMsg.time) > 5 * 60 * 1000) {
        showTimestamp = true
        showUser = true
      }
    } else {
      showTimestamp = true
      showUser = true
    }

    if (showTimestamp) {
      if (moment().diff(msg.time) > 24 * 60 * 60 * 1000)
        timeDisplay = msg.time.local().format("MMMDo A HH:mm")
      else timeDisplay = msg.time.local().format("A HH:mm")
    }

    lastMsg = msg
    return (
      <Message
        key={msg.id}
        data={msg}
        showUser={showUser}
        timeDisplay={timeDisplay}
      />
    )
  })
  useEffect(() => {
    const bodyDiv = bodyRef.current
    bodyDiv.scrollTop = bodyDiv.scrollHeight
  }, [])

  useEffect(() => {
    console.debug("auto scroll down")
    if (messages && messages.length) {
      const lastMsg = messages[messages.length - 1]
      let timeout = 50
      if (lastMsg.type === "sticker") {
        timeout = 500
      }
      scrollToBottomIfNearBottom(timeout)
    }
  }, [messages])
  function scrollToBottomIfNearBottom(timeout) {
    timeout = timeout || 100
    const bodyDiv = bodyRef.current
    if (
      bodyDiv.scrollHeight - bodyDiv.scrollTop - bodyDiv.offsetHeight <
      AUTO_SCROLL_TRESHOLD_DISTANCE
    ) {
      setTimeout(() => {
        bodyDiv.scrollTop = bodyDiv.scrollHeight
      }, timeout)
    }
  }
  function send(input) {
    setSending(true)
    postMessage(other.id, input, offset)
      .then(resp => {
        props.mergeAndSaveNewConversations(resp.data)
        // TODO: maybe display message locally right away

        // let socket server help ping user right away
        socketManager.sendEvent("private message", { userId: other.id })
      })
      .catch(err => {
        console.error(err)
      })
      .then(() => {
        setSending(false)
      })
    return true
  }

  return (
    <div className="sp-inbox-conversation">
      <Button onClick={props.back} className="sp-back-btn" icon="arrow-left" />
      <div className="sp-tab-header">
        <center>
          {/* <Button icon="refresh" size="small">
            刷新
          </Button> */}
          <span>
            与
            <span
              className="sp-conversation-username"
              onClick={() => tabContext.selectOtherUser(other)}
            >
              {other.name}
            </span>
            的对话
          </span>
        </center>
      </div>
      <div ref={bodyRef} style={conversationBodyStyle}>
        {body}
      </div>

      <div className="sp-chat-bottom">
        <InputWithPicker autoFocus={true} sending={sending} send={send} />
      </div>
    </div>
  )
}
export default Conversation
