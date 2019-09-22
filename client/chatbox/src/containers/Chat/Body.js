import React, { useState, useEffect, useContext, useRef } from "react"
import moment from "moment"

import Message from "./Message"
import socketManager from "socket/socket"
import AccountContext from "context/account-context"

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
  const [messages, setMessages] = useState(props.data || [])
  const bodyRef = useRef(null)
  const accountContext = useContext(AccountContext)
  const account = accountContext.account

  useEffect(() => {
    if (!account) {
      console.warn("[Body.js] no account, won't register socket events")
      return
    }
    // console.debug("[Body.js] register socket events")
    socketManager.addHandler("new message", "display_new_message", data => {
      data.time = moment()
      setMessages(prevMessages => {
        return [...prevMessages, data]
      })
      let timeout = 10
      if (data.type === "sticker") timeout = 500
      if (data.type === "image") timeout = 700
      // TODO: use onload event rather than hard code time
      scrollToBottomIfNearBottom(timeout)
    })
    socketManager.addHandler("invitation", "display_new_invitation", data => {
      data.time = moment()
      data.self = data.userId.toString() === account.id.toString()
      setMessages(prevMessages => {
        return [...prevMessages, data]
      })
      let timeout = 10
      scrollToBottomIfNearBottom(timeout)
    })
    socketManager.addHandler(
      "recent messages",
      "display_recent_messages",
      recentMessages => {
        // Receive recent messages of the joined room,
        // should receive right after joining room or when iframe
        // is mounted.
        // Shoudn't display recent messages if there's
        // any messages already being displayed, e.g. joined
        // the room then went offline then back online
        // console.debug(recentMessages)
        recentMessages.forEach(msg => {
          msg.self = msg.userId.toString() === account.id.toString()
          msg.time = moment.utc(msg.timestamp)
        })
        setMessages(recentMessages)
        const timeout = 300
        scrollToBottom(timeout)
      }
    )
    return () => {
      console.debug("[Body.js] unregister socket events")
      socketManager.removeHandler("new message", "display_new_message")
      socketManager.removeHandler("invitation", "display_new_invitation")
      socketManager.removeHandler("recent messages", "display_recent_messages")
    }
  }, [account])
  useEffect(() => {
    // Find media messages and pass to playlist
    // TODO: better to use a playlist context
    // rather than window.setPlaylist
    let mediaIndex = 0
    messages.forEach(msg => {
      if (isMedia(msg)) {
        msg.mediaIndex = mediaIndex
        mediaIndex++
      }
    })
    window.setPlaylist(messages.filter(isMedia))
  }, [messages])

  const scrollToBottomIfNearBottom = timeout => {
    const bodyDiv = bodyRef.current
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

    res.push(
      <Message
        showMenu={account && (account.isMod || msg.self)}
        withHoverCard={true}
        key={msg.id}
        data={msg}
        showUser={showUser}
        timeDisplay={timeDisplay}
        displayMusicTab={props.displayMusicTab}
      />
    )
    lastMsg = msg
  })
  return (
    <div ref={bodyRef} style={chatBodyStyle}>
      {res}
    </div>
  )
}

export default ChatBody
