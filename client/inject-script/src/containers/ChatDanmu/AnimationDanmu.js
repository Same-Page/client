import React, { Component } from "react"
import Danmu from "./Danmu"
import storage from "storage.js"
import "./AnimationDanmu.css"

import { stickersUrl } from "config/urls"
// let invitationStr = " invites you to "
// let lng = window.navigator.userLanguage || window.navigator.language
// if (lng.indexOf("zh") > -1) {
//   invitationStr = " 邀请你去 "
// }
class AnimationDanmu extends Component {
	ROW_NUM = 10
	danmuId = 0 // unique identifier of a danmu, increment locally
	state = {
		danmuList: []
	}
	danmuWaitList = []

	constructor(props) {
		super(props)
		this.realtimeDanmuWrapperRef = React.createRef()
		window.queueAnimationDanmu = this.queueDanmu
	}

	addDanmu = danmu => {
		this.setState((state, props) => {
			state.danmuList.push(danmu)
			return { danmuList: state.danmuList }
		})
	}

	removeDanmu = id => {
		this.setState((state, props) => {
			let newList = state.danmuList.filter(danmu => {
				return danmu.id !== id
			})
			return { danmuList: newList }
		})
	}

	createDanmuObj = data => {
		const content = data.content
		const contentType = content.type
		const danmu = { ...data, id: this.danmuId++, row: 1 }
		danmu.content = content.value
		// if image body
		if (contentType === "sticker") {
			danmu.img = true
			danmu.imgSrc = content.value
		}
		if (contentType === "image") {
			danmu.content = "img"
		}
		if (contentType == "file") {
			danmu.content = "file"
		}
		if (contentType == "url") {
			danmu.content = content.title
		}
		// if (contentType == "text") {
		// 	danmu.content =
		// }
		// if (data.type === "video") {
		//   danmu.content = "视频"
		// }
		return danmu
	}
	findSpot = () => {
		let occupiedRows = {}
		const spacing = 50 // and avatar space
		this.state.danmuList.forEach(danmu => {
			let x =
				danmu.ref.danmuRef.current.getBoundingClientRect().left +
				danmu.ref.danmuRef.current.offsetWidth +
				spacing
			if (x >= window.innerWidth) {
				occupiedRows[danmu.row] = true
			}
			// TODO: can take multiple rows
		})
		for (let i = 1; i <= this.ROW_NUM; i++) {
			if (!occupiedRows[i]) return i
		}
		return null
	}
	checkDanmuWaitlist = () => {
		while (this.danmuWaitList.length) {
			let availableRow = this.findSpot()
			if (availableRow) {
				// console.log('found spot');
				let danmu = this.danmuWaitList.shift()
				danmu.row = availableRow
				danmu.top = 50 * availableRow
				this.addDanmu(danmu)
			} else {
				window.spDebug("no spot")
				setTimeout(this.checkDanmuWaitlist, 1000)
				return
			}
		}
	}
	queueDanmu = msg => {
		// this function is called by other class
		// bind this to current class
		// console.log('realtime queue ' + msg.content);
		this.danmuWaitList.push(this.createDanmuObj(msg))
		this.checkDanmuWaitlist()
	}
	receiveMsgFromChatboxFrame = e => {
		if (!e || !e.data || !e.data.danmu) return
		this.queueDanmu(e.data)
	}
	toggleDanmuVisibility = visible => {
		if (visible) {
			this.realtimeDanmuWrapperRef.current.style.display = "block"
		} else {
			this.realtimeDanmuWrapperRef.current.style.display = "none"
		}
	}
	componentDidMount() {
		window.addEventListener(
			"message",
			this.receiveMsgFromChatboxFrame,
			false
		)
		if (window.chrome && window.chrome.extension) {
			storage.get("realtimeDanmuEnabled", val => {
				if (val != null) {
					this.toggleDanmuVisibility(val)
				}
			})
			window.chrome.storage.onChanged.addListener((changes, area) => {
				if ("realtimeDanmuEnabled" in changes) {
					const newVal = changes["realtimeDanmuEnabled"]["newValue"]
					this.toggleDanmuVisibility(newVal)
				}
			})
		}
	}
	render() {
		return (
			<div id="sp-animation-danmu" ref={this.realtimeDanmuWrapperRef}>
				{this.state.danmuList.map((danmu, index) => (
					<Danmu
						danmu={danmu}
						key={danmu.id}
						ref={_ref => {
							danmu.ref = _ref
						}}
						deleteSelf={this.removeDanmu}
					/>
				))}
			</div>
		)
	}
}

export default AnimationDanmu
