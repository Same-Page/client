import React, { useState, useEffect } from "react"
import Draggable from "react-draggable"

import storage from "storage.js"
import samePageIcon from "icon.png"
import MailIcon from "@material-ui/icons/Mail"

const SHOW_CHAT_ICON_BY_DEFAULT = true
let dragging = false

function ChatIcon({ userCount }) {
	const [showIcon, setShowIcon] = useState(false)
	// const [userCount, setUserCount] = useState()
	const [unreadMail, setUnreadMail] = useState(false)
	// const userCountStr = () => {
	// 	return userCount.join(" | ")
	// }
	useEffect(() => {
		storage.get("showChatIcon", showChatIcon => {
			if (showChatIcon == null) {
				setShowIcon(SHOW_CHAT_ICON_BY_DEFAULT)
			} else {
				setShowIcon(showChatIcon)
			}
		})
		storage.addEventListener("showChatIcon", showChatIcon => {
			setShowIcon(showChatIcon)
		})
		// window.setUserCount = setUserCount

		storage.get("unread", unread => {
			// console.log("get unread")
			// console.log(unread)
			setUnreadMail(!!unread)
		})
		storage.addEventListener("unread", unread => {
			// console.log(unread)
			setUnreadMail(!!unread)
		})
	}, [])

	if (showIcon) {
		let iconContent = (
			<img
				alt="Same Page"
				draggable="false"
				style={{ display: "none" }}
				src={samePageIcon}
			/>
		)
		if (userCount > 0) {
			iconContent = userCount
		}
		if (unreadMail) {
			iconContent = <MailIcon style={{ marginBottom: -7 }} />
		}
		return (
			<Draggable
				onStart={() => {
					dragging = false
					// alert("onStart")
				}}
				onDrag={() => {
					dragging = true
					// alert("onDrag")
				}}
				onStop={e => {
					// alert("onStop")

					if (!dragging) {
						window.toggleChatbox()
					}
					dragging = false
				}}
			>
				<span title="点击打开聊天盒" className="sp-chat-icon-wrapper">
					{iconContent}
				</span>
			</Draggable>
		)
	}
	return <span />
}

export default ChatIcon
