import "./User.css"
import React, { useState, useEffect } from "react"
import Popper from "@material-ui/core/Popper"
import BlockIcon from "@material-ui/icons/Block"
import CheckIcon from "@material-ui/icons/Check"
import storageManager from "storage.js"
import { postMsgToIframe } from "utils/iframe"

function toggleBlock(user, blacklist, block) {
	let res = []
	if (block) {
		res = [...blacklist, user]
	} else {
		res = blacklist.filter(b => {
			return b.id.toString() !== user.id.toString()
		})
	}
	storageManager.set("blacklist", res)
	postMsgToIframe("sp-blacklist", res)
}

function User({ user, blacklist, blacklisted }) {
	const [anchorEl, setAnchorEl] = useState(null)
	const open = Boolean(anchorEl)

	return (
		<span>
			{user.message && !blacklisted && !open && (
				<div className="sp-chat-bubble">{user.message}</div>
			)}
			<span
				onMouseEnter={e => {
					setAnchorEl(e.currentTarget)
				}}
				onMouseLeave={e => {
					setTimeout(() => {
						setAnchorEl(null)
					}, 100)
				}}
			>
				{!blacklisted && (
					<span
						title={user.name}
						style={{ backgroundImage: `url('${user.avatarSrc}')` }}
						className="sp-avatar"
					/>
				)}
				{blacklisted && (
					<span
						// title={user.name}
						style={{ background: "lightgray" }}
						className="sp-avatar"
					/>
				)}

				<Popper
					id={user.id}
					open={open}
					anchorEl={anchorEl}
					placement="top"
				>
					<div className="sp-user-popover">
						{blacklisted && (
							<CheckIcon
								className="blocked"
								onClick={() => {
									toggleBlock(user, blacklist, false)
								}}
							/>
						)}
						{!blacklisted && (
							<BlockIcon
								onClick={() => {
									toggleBlock(user, blacklist, true)
								}}
							/>
						)}
					</div>
				</Popper>
			</span>
		</span>
	)
}
export default User
