import "./ChatboxIframe.css"

import React, { useState, useEffect, useRef } from "react"
import Button from "@material-ui/core/Button"
import Input from "@material-ui/core/Input"

import { Rnd } from "react-rnd"
import { mockUrl, getDomain } from "utils/url"
import { postMsgToIframe } from "utils/iframe"
import storage from "storage.js"
import spConfig from "config"
import spDebug from "config/logger"
import SwapHorizIcon from "@material-ui/icons/SwapHoriz"

import {
	createIframeByDefault,
	showIframeControl,
	defaultIframeSize,
	iframeSrc
} from "config/iframe"
import ImageModal from "../ImageModal"
import socketManager from "services/socket"
import accountManager from "services/account/account"

// const defaultUrl = "http://localhost:3210/"
const defaultUrl = window.location.href
let urlInput = defaultUrl
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

		postMsgToIframe("sp-url-changed", {
			title: document.title,
			url: window.location.href
		})
	}
	setTimeout(() => {
		keepCheckingLocation()
	}, 10 * 1000)
}

function ChatboxIframe({ blacklist }) {
	const [createChatboxIframe, setCreateChatboxIframe] = useState(false)
	// Need to get stored size and position before rendering chatbox iframe
	const [loadingStorage, setLoadingStorage] = useState(true)
	const [x, setX] = useState(5)
	const [size, setSize] = useState(defaultIframeSize)
	const blacklistRef = useRef()
	blacklistRef.current = blacklist
	window.createChatboxIframe = createChatboxIframe
	const [url, setUrl] = useState(defaultUrl)
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
					window.spDebug("updateStorage")
					window.spDebug(data)
					storage.set(data.key, data.value)
				}
				if (data.action === "sp-parent-data") {
					spDebug("post config & account to chatbox")
					postMsgToIframe("sp-parent-data", {
						spConfig: spConfig,
						// pass account to chatbox to get the latest token
						account: accountManager.getAccount(),
						blacklist: blacklistRef.current
					})
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
		storage.get("iframeSize", iframeSize => {
			if (iframeSize) {
				setSize(iframeSize)
			} else {
				iframeSize = defaultIframeSize
			}

			storage.get("iframeX", posX => {
				if (posX) {
					posX = Math.max(posX, 0)
					const iframeWidth = parseInt(iframeSize.width, 10)
					posX = Math.min(posX, window.innerWidth - iframeWidth - 10)

					setX(posX)
				}

				setLoadingStorage(false)
			})
		})
	}, [])

	// Commented out because this happen too fast, chatbox
	// in iframe hasn't registered handler yet
	// useEffect(() => {
	// 	if (createChatboxIframe && accountManager.loggedIn()) {
	// 		// Attempt to connect socket when
	// 		// creating iframe if logged in
	// 		window.spDebug("try connecting when chat box is created")
	// 		socketManager.connect()
	// 	}
	// }, [createChatboxIframe])

	useEffect(() => {
		if (window.location.href !== url && showIframeControl) {
			mockUrl(url)
			// socketManager.changeRoom(getDomain())
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
	if (createChatboxIframe && !loadingStorage) {
		chatboxIframe = (
			<div>
				<ImageModal />
				<Rnd
					style={{ display: display }}
					className="sp-chatbox-iframe-wrapper"
					resizeHandleStyles={{
						right: { right: -10 }
					}}
					// position={{ x: x, y: 0 }}
					default={{
						x: x,
						y: 0, // y value is overridden in css
						width: size.width,
						height: size.height
					}}
					minWidth={defaultIframeSize.minWidth}
					minHeight={defaultIframeSize.minHeight}
					maxHeight={window.innerHeight}
					dragAxis="x"
					onDragStop={(e, d) => {
						storage.set("iframeX", d.x)
					}}
					onResizeStop={(e, direction, ref, delta, position) => {
						storage.set("iframeSize", {
							width: ref.style.width,
							height: ref.style.height
						})
						// console.log(ref.style.height)
					}}
				>
					<div className="sp-chatbox-drag-handle">
						<SwapHorizIcon />
					</div>
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
