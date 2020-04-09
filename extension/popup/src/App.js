/*global chrome*/

import React from "react"
import { Switch, Button } from "antd"
import "antd/dist/antd.css"
import "./index.css"

let AUTO_CONNECT = "Auto Connect"
let AUTO_OPEN_CHATBOX = "Auto Open Chatbox"
let SHOW_CHAT_ICON = "Show Chat Shortcut"
let ENABLE_LIVE_CHAT_DANMU_STR = "Enable Live Chat Danmu"
let ENABLE_VIDEO_DANMU_STR = "Enable Youtube Danmu"
let OPEN_STR = "Open Chatbox"
let CLOSE_STR = "Close Chatbox"
let AVATAR_STR = "Show Online Avatars"
let lng = window.navigator.userLanguage || window.navigator.language
if (lng.indexOf("zh") > -1) {
	AUTO_CONNECT = "自动连接"
	AUTO_OPEN_CHATBOX = "自动打开聊天盒"
	SHOW_CHAT_ICON = "显示聊天图标"
	ENABLE_LIVE_CHAT_DANMU_STR = "显示聊天弹幕"
	ENABLE_VIDEO_DANMU_STR = "显示Youtube弹幕"
	OPEN_STR = "打开聊天盒"
	CLOSE_STR = "关闭聊天盒"
	AVATAR_STR = "显示在线头像"
}

class App extends React.Component {
	constructor(props) {
		super(props)
		this.state = {
			autoConnect: false,
			autoOpenChatbox: false,
			showChatIcon: true,
			realtimeDanmuEnabled: true,
			videoDanmuEnabled: true,
			showAvatars: true,

			toggleChatboxStr: OPEN_STR,
			chatboxState: false,
			ready: false // ready to render
		}
	}
	componentDidMount() {
		for (let key in this.state) {
			// if key isn't in storage, won't change value
			// because callback won't be invoked
			this.getConfigFromStorage(key, value => {
				this.setState({ [key]: value })
			})
		}
		setTimeout(() => {
			this.setState({ ready: true })
		}, 100)
		// shouldn't need to check status because chatbox is never open
		// automatically? WRONG, may click on danmu to open
		this.checkChatboxStatus()
	}
	getConfigFromStorage = (key, callback) => {
		if (chrome.storage) {
			chrome.storage.local.get(key, item => {
				if (key in item) {
					callback(item[key])
				}
			})
		} else {
			if (localStorage.hasOwnProperty(key)) {
				callback(JSON.parse(localStorage.getItem(key)))
			}
		}
	}
	setConfigToStorage = (key, value) => {
		if (chrome.storage) {
			var item = {}
			item[key] = value
			chrome.storage.local.set(item)
		} else {
			localStorage.setItem(key, value)
		}
	}
	onSwitchChange = (key, checked) => {
		// console.log(`switch to ${checked}`);
		this.setConfigToStorage(key, checked)
		this.setState({ [key]: checked })
	}
	msgChatboxFrame = (msg, callback) => {
		if (!chrome.extension) return
		chrome.tabs.query({ active: true, currentWindow: true }, arrayOfTabs => {
			// since only one tab should be active and in the current window at once
			// the return variable should only have one entry
			var activeTab = arrayOfTabs[0]
			var activeTabId = activeTab.id
			// This message is listened by chatbox, but not content.js.
			// then chatbox pass msg to content.js to resize iframe
			callback = callback || (() => {})
			chrome.tabs.sendMessage(activeTabId, { chatboxMsg: msg }, callback)
		})
	}
	checkChatboxStatus = () => {
		// console.log('Check if chatbox open and get online user count');
		// Ask chatbox whether it's open or not
		// And how many users online at current page
		this.msgChatboxFrame("is_chatbox_open", resp => {
			setTimeout(() => {
				this.checkChatboxStatus()
			}, 3000)
			if (resp) {
				if (resp.is_chatbox_open) {
					this.setState({
						toggleChatboxStr: CLOSE_STR
					})
				} else {
					this.setState({
						toggleChatboxStr: OPEN_STR
					})
				}
				this.setState({
					chatboxState: resp.is_chatbox_open
				})
			} else {
				// $('#online-user-msg').text('Please try refreshing this page.');
				// $('#online-user-msg').show();
			}
		})
	}
	openChatbox = () => {
		let msg = "open_chatbox"

		this.msgChatboxFrame(msg)
		if (this.state.chatboxState) {
			this.setState({
				toggleChatboxStr: OPEN_STR
			})
		} else {
			this.setState({
				toggleChatboxStr: CLOSE_STR
			})
		}
		this.setState({
			chatboxState: !this.state.chatboxState
		})
	}
	render() {
		if (!this.state.ready) {
			return <div />
		}
		return (
			<div>
				<div className="option-body">
					{/* <div className="option-row">
						<span className="option-title">{AUTO_CONNECT}</span>{" "}
						<Switch
							checked={this.state.autoConnect}
							onChange={e =>
								this.onSwitchChange("autoConnect", e)
							}
						/>
					</div> */}

					<div className="option-row">
						<span className="option-title">{AUTO_OPEN_CHATBOX}</span>{" "}
						<Switch
							checked={this.state.autoOpenChatbox}
							onChange={e => this.onSwitchChange("autoOpenChatbox", e)}
						/>
					</div>

					<div className="option-row">
						<span className="option-title">{SHOW_CHAT_ICON}</span>{" "}
						<Switch
							checked={this.state.showChatIcon}
							onChange={e => this.onSwitchChange("showChatIcon", e)}
						/>
					</div>

					<div className="option-row">
						<span className="option-title">{ENABLE_LIVE_CHAT_DANMU_STR}</span>{" "}
						<Switch
							checked={this.state.realtimeDanmuEnabled}
							onChange={e => this.onSwitchChange("realtimeDanmuEnabled", e)}
						/>
					</div>
					<div className="option-row">
						<span className="option-title">{AVATAR_STR}</span>{" "}
						<Switch
							checked={this.state.showAvatars}
							onChange={e => this.onSwitchChange("showAvatars", e)}
						/>
					</div>
					{/* <div className="option-row">
            <span className="option-title">{ENABLE_VIDEO_DANMU_STR}</span>{" "}
            <Switch
              checked={this.state.videoDanmuEnabled}
              onChange={e => this.onSwitchChange("videoDanmuEnabled", e)}
            />
          </div> */}
				</div>
				<br />
				<center>
					<Button type="primary" onClick={this.openChatbox}>
						{this.state.toggleChatboxStr}
					</Button>
				</center>
				<br />
			</div>
		)
	}
}

export default App
