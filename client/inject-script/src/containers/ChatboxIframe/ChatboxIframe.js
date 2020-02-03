import React, { useState, useEffect, useRef } from "react"
import Button from "@material-ui/core/Button"
import Input from "@material-ui/core/Input"

import { Rnd } from "react-rnd"
import { mockUrl, getDomain } from "utils/url"
import { postMsgToIframe } from "utils/iframe"
import storage from "storage.js"
import spConfig from "config"
import spDebug from "config/logger"

import "./ChatboxIframe.css"
import {
	createIframeByDefault,
	showIframeControl,
	iframeSize,
	iframeSrc
} from "config/iframe"
import ImageModal from "../ImageModal"
import socketManager from "services/socket"
import accountManager from "services/account/account"

let urlInput = window.location.href
let fakeUrl = false
let curUrl = window.location.href

function keepCheckingLocation() {
	// Stop this timer if url is ever manually set because
	// that's either local testing or the web version
	if (fakeUrl) return
	if (window.location.href === curUrl) {
		// window.spDebug('url not changed')
	} else {
		window.spDebug("url changed")
		curUrl = window.location.href
		const msg = {
			locationUpdate: true,
			title: document.title,
			url: window.location.href
		}
		// if (this.iframeRef.current) {
		//   this.iframeRef.current.contentWindow.postMessage(msg, "*")
		// }
		socketManager.updatePageInfo(msg)
	}
	setTimeout(() => {
		keepCheckingLocation()
	}, 10 * 1000)
}

function ChatboxIframe(props) {
	const [createChatboxIframe, setCreateChatboxIframe] = useState(false)
	window.createChatboxIframe = createChatboxIframe
	const [url, setUrl] = useState(window.location.href)
	const [display, setDisplay] = useState("block")

	const iframeRef = useRef()
	window.chatboxIframeRef = iframeRef

	const isChatboxOpen = () => {
		return createChatboxIframe && display === "block"
	}
	window.isChatboxOpen = isChatboxOpen

	const toggleChatbox = () => {
		// if iframe not created, create iframe (default display)
		// if iframe is created, toggle show hide
		if (isChatboxOpen()) {
			setDisplay("none")
		} else {
			setDisplay("block")
			setCreateChatboxIframe(true)
		}
	}
	window.toggleChatbox = toggleChatbox

	useEffect(() => {
		keepCheckingLocation()
		window.addEventListener(
			"message",
			e => {
				if (!e || !e.data) return
				const data = e.data

				if (data === "minimize") {
					setDisplay("none")
				}
				if (data.action === "updateStorage") {
					// window.spDebug(data)
					storage.set(data.key, data.value)
				}
				if (data.action === "getConfig") {
					spDebug("post config to chatbox")
					postMsgToIframe("config", spConfig)
				}
			},
			false
		)
		storage.get("autoOpenChatbox", autoOpenChatbox => {
			// const autoOpen = autoOpenChatbox == null ? createIframeByDefault : autoOpenChatbox
			// setCreateChatboxIframe(autoOpen)

			if (autoOpenChatbox == null) {
				setCreateChatboxIframe(createIframeByDefault)
			} else {
				setCreateChatboxIframe(autoOpenChatbox)
			}
		})
	}, [])

	useEffect(() => {
		if (createChatboxIframe && accountManager.loggedIn()) {
			// Attempt to connect socket when
			// creating iframe if logged in
			window.spDebug("try connecting when chat box is created")
			socketManager.connect()
		}
	}, [createChatboxIframe])

	useEffect(() => {
		if (window.location.href !== url && showIframeControl) {
			mockUrl(url)
			socketManager.changeRoom(getDomain())
		}
	}, [url])

	let iframeControl = ""
	if (showIframeControl) {
		iframeControl = (
			<div>
				<h1>
					<br />
					<center>Welcome to use Same Page</center>
				</h1>
				<div style={{ padding: 20, maxWidth: 500 }}>
					<span style={{ marginBottom: 5 }}>URL: </span>
					<Input
						style={{ width: 150, marginLeft: 5 }}
						placeholder="https://www.google.com"
						size="large"
						color="primary"
						variant="contained"
						defaultValue={urlInput}
						onChange={e => (urlInput = e.target.value)}
					/>
					<Button
						color="primary"
						variant="contained"
						className="sp-blue-button"
						style={{ marginLeft: 10 }}
						size="small"
						onClick={() => {
							setUrl(urlInput)
							fakeUrl = true
						}}
					>
						update!
					</Button>
				</div>
			</div>
		)
	}
	let chatboxIframe = ""
	if (createChatboxIframe) {
		chatboxIframe = (
			<div>
				<ImageModal />
				<Rnd
					style={{ display: display }}
					className="sp-chatbox-iframe-wrapper"
					resizeHandleStyles={{
						right: { right: -10 }
					}}
					default={{
						x: 0,
						y: 0, // y value is overridden in css
						width: iframeSize.width,
						height: iframeSize.height
					}}
					minWidth={220}
					dragAxis="x"
				>
					<div className="sp-chatbox-drag-handle"></div>
					<iframe
						allow="autoplay"
						allowFullScreen={true}
						webkitallowfullscreen="true"
						mozallowfullscreen="true"
						title="same page chat box"
						ref={iframeRef}
						className="sp-chatbox-iframe"
						src={iframeSrc + "?" + url}
					/>
				</Rnd>
			</div>
		)
	}

	return (
		<div className="sp-iframe-div">
			{iframeControl}
			{chatboxIframe}
		</div>
	)
}

export default ChatboxIframe

if (window.chrome && window.chrome.extension) {
	window.chrome.runtime.onMessage.addListener(
		(request, sender, sendResponse) => {
			if (!request.chatboxMsg) return
			var msg = request.chatboxMsg
			window.spDebug(msg)
			if (msg === "open_chatbox") {
				window.toggleChatbox()
			}
			if (msg === "is_chatbox_open") {
				sendResponse({ is_chatbox_open: window.isChatboxOpen() })
			}
		}
	)
}
