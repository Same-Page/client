import "./Room.css"
import React, { useState, useEffect } from "react"
import Draggable from "react-draggable"

import ChatIcon from "containers/ChatIcon"
import User from "containers/User"
import storageManager from "storage.js"
import spConfig from "config"

const MSG_TIMEOUT = 7 * 1000

function Room({ blacklist, isBlacklisted }) {
	const [rooms, setRooms] = useState({})
	// {
	//	 '<room type>': [<list of users>],
	// }
	const [showAvatars, setShowAvatars] = useState(spConfig.showAvatars)
	const [roomType, setRoomType] = useState(spConfig.defaultChatView)

	const getRoom = roomType => {
		return rooms[roomType]
	}
	const getRoomFromId = id => {
		// TODO
	}
	const removeUserMessage = (user, type) => {
		const usersInRoom = getRoom(type)
		const users = usersInRoom.map(u => {
			if (u.id.toString() === user.id.toString()) {
				delete u.delMessageTimeout
				delete u.message
				return {
					...u
				}
			}
			return u
		})
		setRooms({ ...rooms, [type]: users })
	}
	const room = getRoom(roomType)
	// console.log("room")
	// console.log(room)
	useEffect(() => {
		// not best practice, but much simpler than adding callbacks
		// to socket, also socket gets re instantiate when reconnect

		// Room component is never unmounted, no need to clean up
		window.setUserMessage = (user, type, content) => {
			const room = getRoom(type)
			const users = room.map(u => {
				if (u.id.toString() === user.id.toString()) {
					// foundUser = true
					if (u.delMessageTimeout) {
						clearTimeout(u.delMessageTimeout)
					}
					return {
						...u,
						message: content.value || content.title || content.url,
						delMessageTimeout: setTimeout(() => {
							removeUserMessage(user, type)
						}, MSG_TIMEOUT)
					}
				}
				return u
			})
			setRooms({ ...rooms, [type]: users })
		}
		window.leftRoom = roomId => {
			if (!roomId) {
				setRooms({})
			} else {
				// TODO
				// backend should return room type etc..
				// setRooms({ ...rooms, [type]: [] })
			}
		}
		window.setUsersInRoom = data => {
			const res = {}
			Object.keys(data).forEach(roomId => {
				const room = data[roomId]
				if (room.users) {
					res[room.type] = room.users
				}
			})

			setRooms({ ...rooms, ...res })
		}
		window.addUserToRoom = (type, user) => {
			const room = getRoom(type)
			if (room) {
				const existingUser = room.filter(u => {
					return u.id === user.id
				})
				if (existingUser.length) {
					return
				}
				setRooms({ ...rooms, [type]: [...room, user] })
			} else {
				console.error(
					`Failed to add user to room, room type ${type} not exist`
				)
			}
		}
		window.removeUserFromRoom = (type, user) => {
			const room = getRoom(type)
			if (room) {
				// const newRoom =
				// room.push(user)
				const users = room.filter(u => {
					return u.id !== user.id
				})
				setRooms({ ...rooms, [type]: [...users] })
			} else {
				console.error(
					`Faileed to remove user from room, room type ${type} not exist`
				)
			}
		}
	}, [rooms])

	useEffect(() => {
		storageManager.get("showAvatars", showAvatars => {
			if (showAvatars !== null) {
				setShowAvatars(showAvatars)
			}
		})
		storageManager.addEventListener("showAvatars", showAvatars => {
			setShowAvatars(showAvatars)
		})

		window.addEventListener(
			"message",
			e => {
				if (!e || !e.data) return
				if (e.data.type === "sp-change-chat-view") {
					const chatView = e.data.data
					setRoomType(chatView)
				}
			},
			false
		)
	}, [])

	return (
		<span>
			<ChatIcon userCount={room && room.length} />
			{showAvatars && room && (
				<Draggable>
					<span className="sp-users-wrapper">
						{room.map(u => {
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
