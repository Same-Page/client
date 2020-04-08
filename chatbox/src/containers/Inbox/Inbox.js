import "./Inbox.css"
import React, { useEffect, useState, useRef } from "react"
import { Avatar, Icon, Radio, Button, message } from "antd"
import moment from "moment"
import { useIntl } from "react-intl"
import { connect } from "react-redux"

import Conversation from "./Conversation"
import { getMessages } from "services/message"

import storageManager from "utils/storage"
import { msgOtherUser } from "redux/actions"
function Inbox(props) {
  const user = props.user
  const setUser = props.msgOtherUser
  const intl = useIntl()
  const account = props.account

  if (!account) {
    return (
      <div className="sp-inbox-tab">
        <center className="sp-tab-header">
          {intl.formatMessage({ id: "not.login" })}
        </center>
      </div>
    )
  }

  const activeTab = props.tab
  const storageKey = "inbox-" + account.id
  // can't use "inbox-id-offset" yet because injection
  // script is still reading inbox-offset
  // const storageOffsetKey = storageKey + "-offset"
  const storageOffsetKey = "inbox-offset"
  const prevAccountRef = useRef()
  const activeTabRef = useRef()
  const conversationsRef = useRef()
  const [conversations, setConversations] = useState({})
  const [showNotifications, setShowNotifications] = useState(false)
  // offset equals to the biggest message id
  const [loading, setLoading] = useState(false)
  let selectedConversation = null
  if (user) {
    if (user.id in conversations) {
      selectedConversation = conversations[user.id]
    } else {
      selectedConversation = {
        user: user,
        messages: []
      }
      setConversations({ ...conversations, [user.id]: selectedConversation })
    }
  }
  function getMessagesFromServer(offset, noPopup) {
    // usually we can get offset directly from
    // conversations variable. But when user login,
    // we set conversation and immediately getMessagesFromServer
    // before conversation is updated and there isn't a callback
    // for useState atm
    offset = offset || getOffset(conversationsRef.current)
    setLoading(true)
    getMessages(offset)
      .then(resp => {
        // Merge with existing data
        // TODO: mergeAndSaveNewConversations doesn't dedup
        // it trusts whatever server returns and there could be
        // duplicate with data in localstorage when multiple tabs
        // pull at the same time?
        // Have a simple offset check for now
        const newConversations = resp.data
        let hasNewMessage = false
        const newOffset = getOffset(newConversations)

        storageManager.set(storageOffsetKey, Math.max(newOffset, offset))
        if (newOffset > offset) {
          mergeAndSaveNewConversations(newConversations)
          hasNewMessage = true
        } else {
          // message.info("没有新私信", 2)
          console.warn("[Inbox] received offset no bigger than local offset")
        }

        if (hasNewMessage && offset && !noPopup) {
          // `&& offset` because don't want to show popup
          // when user login after logout (messages are deleted)
          message.success(intl.formatMessage({ id: "new.mail" }), 2)
        }
        const unreadKey = "unread"
        storageManager.set(unreadKey, false)
      })
      .catch(err => {
        console.error(err)
      })
      .then(() => {
        setLoading(false)
      })
  }
  window.getMessagesFromServer = getMessagesFromServer
  function mergeAndSaveNewConversations(newConversations) {
    // console.log("mergeAndSaveNewConversations")
    // merge and save new conversations into storage
    storageManager.get(storageKey, conversations => {
      conversations = conversations || {}
      Object.keys(newConversations).forEach(userId => {
        if (userId in conversations) {
          conversations[userId].messages.push(
            ...newConversations[userId].messages
          )
          // use the new user data
          conversations[userId].user = newConversations[userId].user
        } else {
          conversations[userId] = newConversations[userId]
        }
        // Ensure unique messages
        conversations[userId].messages = [
          ...new Set(conversations[userId].messages)
        ]
      })
      storageManager.set(storageKey, conversations)
      const offset = getOffset(conversations)
      storageManager.set(storageOffsetKey, offset)
    })
  }
  function getOffset(conversations) {
    let offset = 0
    conversations = conversations || {}
    Object.values(conversations).forEach(c => {
      if (c.messages.length) {
        c.lastMsg = c.messages[c.messages.length - 1]
        offset = Math.max(offset, c.lastMsg.id)
      }
    })
    // window.spDebug(offset)

    return offset
  }
  useEffect(() => {
    // whenever switch to inbox tab or
    // account updated, fetch mail
    // TODO: account update shouldn't fetch mail
    // only if account changed
    if (activeTab === "inbox" && account) {
      window.spDebug("[inbox] logged in, load from storage")
      storageManager.get(storageKey, conversations => {
        conversations = conversations || {}
        setConversations(conversations)
        window.spDebug("[inbox] loaded from storage, fetch from server")
        const offset = getOffset(conversations)
        getMessagesFromServer(offset)
      })
    }
    activeTabRef.current = activeTab
  }, [activeTab, account])

  useEffect(() => {
    if (account) {
      if (!prevAccountRef.current) {
        window.spDebug("register inbox storage listener")
        // TODO: if same account login and logout and login again
        // this listener is registered multiple times, should unregister
        // when logout
        storageManager.addEventListener(storageKey, conversations => {
          window.spDebug("[inbox] storage updated")
          conversations = conversations || {}
          setConversations(conversations)
        })
      }
    } else {
      window.spDebug("[inbox] logged out")
      setUser(null)
      setConversations({})
    }
    prevAccountRef.current = account
  }, [account])

  useEffect(() => {
    storageManager.addEventListener("unread", unread => {
      if (unread) {
        if (activeTabRef.current === "inbox") {
          getMessagesFromServer(null, true)
        }
      }
    })
  }, [])

  useEffect(() => {
    conversationsRef.current = conversations
  }, [conversations])

  // useEffect(() => {
  // Listen for account change, 2 cases:
  // 1. not logged in => logged in  (this may not be when
  // the whole app logged in, since Inbox component is mounted
  // later than the App component)
  // 2. logged in => logged out

  // There shouldn't be a case that's logged in as user A
  // then suddenly changed to user B without going through
  // a log out step

  // When logged in
  // 0. clear messages in memory (not in storage)
  // 1. get messages from storage
  // 2. get new messages from server using offset and save into storage

  // When logged out, clear the memory

  // const login = account && !prevAccountRef.current
  // const logout = prevAccountRef.current && !account

  // if (login) {
  // let storageKey = "inbox-" + account.id
  // window.spDebug("[inbox] logged in, load from storage")
  // storageManager.get(storageKey, conversations => {
  //   conversations = conversations || {}
  //   setConversations(conversations)
  //   window.spDebug("[inbox] loaded from storage, fetch from server")
  //   getMessagesFromServer(getOffset(conversations))
  // })
  // window.spDebug("register inbox storage listener")
  // // TODO: if same account login and logout and login again
  // // this listener is registered multiple times, should unregister
  // // when logout
  // storageManager.addEventListener(storageKey, conversations => {
  //   window.spDebug("[inbox] storage updated")
  //   setConversations(conversations)
  // })
  // }

  //   if (logout) {
  //     window.spDebug("[inbox] logged out")
  //     setUser(null)
  //     setConversations({})
  //     // Clear memory
  //   }

  //   prevAccountRef.current = account
  // }, [account])

  // Backend/storage returns dictionary data structure so
  // it's easy to insert new conversation
  // Need to convert into array and sort by date to display
  // Also get offset
  const conversationsArray = Object.keys(conversations).map(userId => {
    const c = conversations[userId]
    if (c.messages.length) {
      c.lastMsg = c.messages[c.messages.length - 1]
      c.time = moment.utc(c.lastMsg.created)
    } else {
      // if no message, this is user attempting to start conversation
      c.time = moment.utc()
    }
    return c
  })

  conversationsArray.sort((a, b) => {
    return b.time - a.time
  })

  let rows = conversationsArray.map(c => {
    const user = c.user
    return (
      <div
        onClick={() => {
          setUser(user)
        }}
        key={user.id}
        className="sp-inbox-row"
      >
        <Avatar icon="user" src={user.avatarSrc} />
        <span className="sp-row-right">
          <div>
            {user.name}
            {c.lastMsg && (
              <span className="sp-message-time">{c.time.fromNow()}</span>
            )}
          </div>
          {c.lastMsg && (
            <div className="sp-message-content">{c.lastMsg.content}</div>
          )}
        </span>
      </div>
    )
  })
  if (conversationsArray.length === 0) {
    rows = (
      <center style={{ margin: 20 }}>
        {intl.formatMessage({ id: "empty" })}
      </center>
    )
  }

  return (
    <div className="sp-inbox-tab">
      {selectedConversation && !showNotifications && (
        <Conversation
          account={account}
          back={() => {
            setUser(null)
          }}
          offset={getOffset(conversations)}
          conversation={selectedConversation}
          mergeAndSaveNewConversations={mergeAndSaveNewConversations}
        />
      )}
      {!selectedConversation && (
        <div>
          <center className="sp-tab-header">
            {loading && (
              <Button size="small" className="sp-back-btn" icon="loading" />
            )}
            {!loading && (
              <Button
                onClick={() => {
                  getMessagesFromServer()
                }}
                className="sp-back-btn"
                // style={{ border: "none", padding: 0 }}
                size="small"
                icon="reload"
              />
            )}
            <Radio.Group
              size="small"
              defaultValue={showNotifications}
              buttonStyle="solid"
              onChange={e => {
                setShowNotifications(e.target.value)
              }}
            >
              <Radio.Button value={false}>
                {intl.formatMessage({ id: "mail" })}
              </Radio.Button>
              <Radio.Button value={true}>
                {" "}
                {intl.formatMessage({ id: "notification" })}
              </Radio.Button>
            </Radio.Group>
          </center>
          <div className="sp-tab-body" style={{ paddingBottom: 70 }}>
            {!showNotifications && rows}
            {showNotifications && (
              <center style={{ margin: 20 }}>
                {intl.formatMessage({ id: "empty" })}
              </center>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

const stateToProps = state => {
  return { tab: state.tab, user: state.inboxUser, account: state.account }
}
export default connect(stateToProps, { msgOtherUser })(Inbox)
