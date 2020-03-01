import "./User.css"
import React, { useState, useEffect } from "react"

function User({ user }) {
	return (
		<span>
			{user.message && (
				<div className="sp-chat-bubble">{user.message}</div>
			)}
			<span
				draggable="false"
				style={{ backgroundImage: `url('${user.avatarSrc}')` }}
				className="sp-avatar"
			/>
		</span>
	)
}
export default User
