import "./User.css"
import React, { useState, useEffect } from "react"

function User({ user }) {
	return (
		<span>
			<div className="sp-chat-bubble">user.name</div>
			<img draggable="false" src={user.avatarSrc} className="sp-avatar" />
		</span>
	)
}
export default User
