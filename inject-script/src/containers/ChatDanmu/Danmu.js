import React, { Component } from "react"

class Danmu extends Component {
	state = {}
	constructor(props) {
		super(props)
		this.danmuRef = React.createRef()
	}

	componentDidMount() {
		let startX = window.innerWidth
		let duration = (startX + 1000) / 100

		//.animate isn't supported by safari
		// TODO: maybe use animation.js lib?
		if (!this.danmuRef.current.animate) {
			this.props.deleteSelf(this.props.danmu.id)
			return
		}
		let danmuAnimation = this.danmuRef.current.animate(
			[
				// keyframes, at least two
				{ transform: "translateX(" + startX + "px)" },
				{ transform: "translateX(-1000px)" }
			],
			{
				// timing options
				duration: duration * 1000
				// easing: 'ease-in-out'
			}
		)
		danmuAnimation.onfinish = () => {
			this.props.deleteSelf(this.props.danmu.id)
		}
		this.danmuRef.current.onmouseover = () => {
			danmuAnimation.pause()
		}
		this.danmuRef.current.onmouseout = () => {
			danmuAnimation.play()
		}
		this.danmuRef.current.onmousedown = () => {
			window.toggleChatbox()
		}
	}
	render() {
		const user = this.props.danmu.user
		let avatar = ""
		if (user.avatarSrc) {
			avatar = (
				<img alt="" className="sp-danmu-avatar" src={user.avatarSrc} />
			)
		}
		let textContentClass = "sp-danmu-content-text"
		if (this.props.danmu.self) {
			textContentClass += " self"
			// console.log(this.props.danmu);
		}
		textContentClass += " " + this.props.danmu.type
		let content = (
			<span
				className={textContentClass}
				dangerouslySetInnerHTML={{ __html: this.props.danmu.content }}
			/>
		)
		if (this.props.danmu.img) {
			content = (
				<img
					alt=""
					className="sp-danmu-content-img"
					src={this.props.danmu.imgSrc}
				/>
			)
		}
		return (
			<div
				className="sp-danmu-wrapper"
				style={{ top: this.props.danmu.top }}
				ref={this.danmuRef}
			>
				{avatar}
				{content}
			</div>
		)
	}
}

export default Danmu
