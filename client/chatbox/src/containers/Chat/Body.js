import React, { useState, useEffect, useContext, useRef } from "react"
import moment from "moment"
// import { connect } from "react-redux"

import Message from "./Message"
import socketManager from "socket/socket"
import AccountContext from "context/account-context"
import spDebug from "config/logger"

const chatBodyStyle = {
  height: "calc(100% - 107px)",
  overflowY: "auto",
  overflowX: "hidden",
  width: "100%",
  position: "fixed",
  background: "#f6f9fc",
  padding: 10,
  paddingBottom: 50
}
const AUTO_SCROLL_TRESHOLD_DISTANCE = 300

function isMedia(msg) {
  return msg.type === "audio" || msg.type === "video"
}

function ChatBody(props) {
  const { messages, setMessages, chatView } = props
  const msgNum = messages.length
  const bodyRef = useRef(null)
  const accountContext = useContext(AccountContext)
  const account = accountContext.account
  const chatMsgCallbackName = "display_new_message_" + chatView
  useEffect(() => {
    scrollToBottomIfNearBottom(10)
  }, [msgNum])
  useEffect(() => {
    // TODO: seems no need to remove socket handler when account state change

    if (!account) {
      console.warn("[Body.js] no account, won't register socket events")
      return
    }
    window.spDebug("[Body.js] register socket events")
    socketManager.addHandler("chat message", chatMsgCallbackName, data => {
      if (data.roomType != chatView) return
      data.self = data.user.id.toString() === account.id.toString()
      data.time = moment()
      spDebug("[chatbox] chat message")
      setMessages(prevMessages => {
        // update own message
        let i = 0
        for (; i < prevMessages.length; i++) {
          if (prevMessages[i].id.toString() === data.id.toString()) {
            break
          }
        }
        if (i < prevMessages.length) {
          // if found existing message, update it
          const messages = [...prevMessages]
          messages[i] = data
          return messages
        }

        return [...prevMessages, data]
      })
      if (!data.self) {
        let timeout = 10
        // if (data.type === "sticker") timeout = 500
        // if (data.type === "image") timeout = 1000
        // TODO: use onload event rather than hard code time
        scrollToBottomIfNearBottom(timeout)
      }
    })
    // socketManager.addHandler("invitation", "display_new_invitation", data => {
    //   data.time = moment()
    //   data.self = data.user.id.toString() === account.id.toString()
    //   setMessages(prevMessages => {
    //     return [...prevMessages, data]
    //   })
    //   let timeout = 10
    //   scrollToBottomIfNearBottom(timeout)
    // })
    // socketManager.addHandler(
    //   "recent messages",
    //   "display_recent_messages",
    //   recentMessages => {
    //     // Receive recent messages of the joined room,
    //     // should receive right after joining room or when iframe
    //     // is mounted.
    //     // Shoudn't display recent messages if there's
    //     // any messages already being displayed, e.g. joined
    //     // the room then went offline then back online
    //     // window.spDebug(recentMessages)
    //     recentMessages.forEach(msg => {
    //       msg.self = msg.user.id.toString() === account.id.toString()
    //       msg.time = moment.utc(msg.timestamp)
    //     })
    //     setMessages(recentMessages)
    //     const timeout = 300
    //     scrollToBottom(timeout)
    //   }
    // )
    return () => {
      window.spDebug("[Body.js] unregister socket events")
      socketManager.removeHandler("chat message", chatMsgCallbackName)
      // socketManager.removeHandler("invitation", "display_new_invitation")
      // socketManager.removeHandler("recent messages", "display_recent_messages")
    }
  }, [account])
  // useEffect(() => {
  //   // Find media messages and pass to playlist
  //   // TODO: better to use a playlist context
  //   // rather than window.setPlaylist
  //   let mediaIndex = 0
  //   messages.forEach(msg => {
  //     if (isMedia(msg)) {
  //       msg.mediaIndex = mediaIndex
  //       mediaIndex++
  //     }
  //   })
  //   window.setPlaylist(messages.filter(isMedia))
  // }, [messages])
  const imageLoadedCb = () => {
    scrollToBottomIfNearBottom(10)
  }
  const scrollToBottomIfNearBottom = timeout => {
    const bodyDiv = bodyRef.current
    if (!bodyDiv) return
    if (
      bodyDiv.scrollHeight - bodyDiv.scrollTop - bodyDiv.offsetHeight <
      AUTO_SCROLL_TRESHOLD_DISTANCE
    ) {
      scrollToBottom(timeout)
    }
  }
  const scrollToBottom = timeout => {
    timeout = timeout || 100
    const bodyDiv = bodyRef.current
    setTimeout(() => {
      bodyDiv.scrollTop = bodyDiv.scrollHeight
    }, timeout)
  }

  let res = []
  let lastMsg = null

  messages.forEach(msg => {
    // If same user is talking, no need to show user's avatar again
    let showUser = true
    // If it's been more than 5 mins since last msg
    let showTimestamp = false
    let timeDisplay = null

    if (lastMsg) {
      if (lastMsg.user.id.toString() === msg.user.id.toString())
        showUser = false
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
        timeDisplay = msg.time.local().format("MMMDo HH:mm")
      else timeDisplay = msg.time.local().format("HH:mm")
    }

    res.push(
      <Message
        showMenu={account && (account.isMod || msg.self)}
        withHoverCard={true}
        key={msg.id}
        data={msg}
        showUser={showUser}
        timeDisplay={timeDisplay}
        displayMusicTab={props.displayMusicTab}
        imageLoadedCb={imageLoadedCb}
      />
    )
    lastMsg = msg
  })

  return (
    <span>
      {props.show && (
        <div ref={bodyRef} style={chatBodyStyle}>
          {res}
        </div>
      )}
    </span>
  )
}
export default ChatBody
// const stateToProps = (state, props) => {
//   return { show: state.chatView === props.chatView }
// }

// export default connect(stateToProps)(ChatBody)
