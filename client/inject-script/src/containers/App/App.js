import spDebug from "config/logger"
import React, { useEffect } from "react"
// AnimationDanmu is a confusing name, it means realtime chat danmu
// powered by css + js, different from video danmu that's powered by canvas
import AnimationDanmu from "../ChatDanmu/AnimationDanmu"
import ChatboxIframe from "../ChatboxIframe"
import ChatIcon from "../ChatIcon"

import axios from "axios"

import storage from "storage.js"
import socketManager from "services/socket"
import accountManager from "services/account"
import { apiUrl } from "../../config/urls"

const autoConnectByDefault = true
const unreadKey = "unread"
const inboxOffsetKey = "inbox-offset"
function getMessageOffset(conversations) {
  let offset = 0
  Object.values(conversations).forEach(c => {
    if (c.messages.length) {
      c.lastMsg = c.messages[c.messages.length - 1]
      offset = Math.max(offset, c.lastMsg.id)
    }
  })
  return offset
}
spDebug('starting injection script...')

function App(props) {
  useEffect(() => {
    // Get account from storage
    // get config from storage
    storage.get("autoConnect", autoConnect => {
      if (autoConnect == null) {
        // autoConnect is true by default  in the menu
        autoConnect = autoConnectByDefault
      }
      window.autoConnect = autoConnect

      accountManager.init(account => {
        if (account) {
          // console.debug("has account")
          if (autoConnect) {
            // console.debug("auto connect")
            socketManager.connect()
          }

          // get local messages then check if any new from server
          // if there's still unread, no need to check with server

          storage.get(unreadKey, unread => {
            if (!unread) {
              storage.get(inboxOffsetKey, offset => {
                offset = offset || 0
                // console.log("offset " + offset)
                const url = `${apiUrl}/api/v1/messages?offset=${offset}`
                const headers = {
                  token: account.token
                }
                // can't make ajax call in content script since chrome 73
                // proxy through background script
                if (window.chrome && window.chrome.extension) {
                  window.chrome.runtime.sendMessage(
                    {
                      makeRequest: true,
                      url: url,
                      options: {
                        method: "GET",
                        headers: headers
                      }
                    },
                    response => {
                      if (response && response.ok) {
                        if (getMessageOffset(response.data)) {
                          storage.set(unreadKey, true)
                        }
                        // console.log(response.data)
                      } else {
                        console.error(response)
                      }
                    }
                  )
                } else {
                  axios
                    .get(url, { headers: headers })
                    .then(response => {
                      if (getMessageOffset(response.data)) {
                        storage.set(unreadKey, true)
                      }
                    })
                    .catch(err => {
                      console.error(err)
                    })
                    .then(res => {})
                }
              })
            }
          })
        } else {
          console.debug("no account found")
        }
      })
    })
  }, [])

  return (
    <span>
      <ChatIcon />
      <ChatboxIframe />
      <AnimationDanmu />
    </span>
  )
}

export default App
