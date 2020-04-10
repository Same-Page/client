import spDebug from "config/logger"
import spConfig from "config"
import React, { useEffect, useState } from "react"
// AnimationDanmu is a confusing name, it means realtime chat danmu
// powered by css + js, different from video danmu that's powered by canvas
import AnimationDanmu from "../ChatDanmu/AnimationDanmu"
import ChatboxIframe from "../ChatboxIframe"
import Room from "../Room"

import axios from "axios"

import storage from "storage.js"
import socketManager from "services/socket"
import accountManager from "services/account"
import { apiUrl } from "../../config/urls"

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

function App(props) {
	const [blacklist, setBlacklist] = useState([])
	const isBlacklisted = u => {
		const res = blacklist.find(b => {
			return b.id.toString() === u.id.toString()
		})
		return !!res
	}
	useEffect(() => {
		// Get account from storage
		// get config from storage
		storage.get("realtimeDanmuEnabled", autoConnect => {
			// storage.get("autoConnect", autoConnect => {

			if (autoConnect == null) {
				autoConnect = spConfig.showDanmu
			}
			window.autoConnect = autoConnect

			accountManager.init(account => {
				if (account) {
					window.spDebug("has account")
					if (autoConnect) {
						window.spDebug("auto connect")
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
					window.spDebug("no account found")
				}
			})
		})

		storage.get("blacklist", blacklist => {
			if (blacklist !== null) {
				setBlacklist(blacklist)
			}
		})
		storage.addEventListener("blacklist", blacklist => {
			setBlacklist(blacklist)
		})
	}, [])

	return (
		<span>
			<Room blacklist={blacklist} isBlacklisted={isBlacklisted} />
			<ChatboxIframe blacklist={blacklist} />
			<AnimationDanmu blacklist={blacklist} isBlacklisted={isBlacklisted} />
		</span>
	)
}

window.addEventListener(
	"message",
	e => {
		if (!e || !e.data) return
		if (e.data.type === "sp-change-bg") {
			const imgUrl = `url("${e.data.data}")`
			// console.log(imgUrl)
			if (document.body.style.backgroundImage !== imgUrl) {
				document.body.style.backgroundImage = imgUrl
				document.body.style.backgroundSize = `cover`
				document.body.style.backgroundRepeat = `no-repeat`
			} else {
				document.body.style.backgroundImage = ""
			}
		}
	},
	false
)

export default App
