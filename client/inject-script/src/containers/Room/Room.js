import "./Room.css"
import React, { useState, useEffect } from "react"
import Draggable from "react-draggable"

import ChatIcon from "containers/ChatIcon"
import User from "containers/User"

function Room(props) {
	const [users, setUsers] = useState([])
	useEffect(() => {
		// not best practice, but much simpler than adding callbacks
		// to socket, also socket gets re instantiate when reconnect
		window.setUsers = setUsers
	}, [])

	return (
		<span>
			<ChatIcon userCount={users.length} />
			<Draggable>
				<span className="sp-users-wrapper">
					{users.map(u => (
						<User
							// style={{ height: 50, width: 50 }}
							key={u.id}
							user={u}
						/>
					))}
				</span>
			</Draggable>
		</span>
	)
}

export default Room
