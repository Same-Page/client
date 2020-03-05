import "./Room.css"
import React, { useState, useEffect } from "react"
import Draggable from "react-draggable"

import ChatIcon from "containers/ChatIcon"
import User from "containers/User"
import storageManager from "storage.js"
import spConfig from "config"

function Room({ blacklist, isBlacklisted }) {
	const [users, setUsers] = useState([])
	const [showAvatars, setShowAvatars] = useState(spConfig.showAvatars)

	useEffect(() => {
		// not best practice, but much simpler than adding callbacks
		// to socket, also socket gets re instantiate when reconnect
		window.setUsers = setUsers

		storageManager.get("showAvatars", showAvatars => {
			if (showAvatars !== null) {
				setShowAvatars(showAvatars)
			}
		})
		storageManager.addEventListener("showAvatars", showAvatars => {
			setShowAvatars(showAvatars)
		})
	}, [])

	return (
		<span>
			<ChatIcon userCount={users.length} />
			{showAvatars && (
				<Draggable>
					<span className="sp-users-wrapper">
						{users.map(u => {
							return (
								<User
									blacklist={blacklist}
									blacklisted={isBlacklisted(u)}
									key={u.id}
									user={u}
								/>
							)
						})}
					</span>
				</Draggable>
			)}
		</span>
	)
}

export default Room
