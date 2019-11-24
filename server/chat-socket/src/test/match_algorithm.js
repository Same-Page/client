"use strict"
console.log("test matching")
const fs = require("fs")
const os = require("os")
const tagManager = require("../tag.js")
const roomManager = require("../room.js")

fs.readFile(os.homedir() + "/project/socket-log/log1.txt", "utf8", function(
	err,
	contents
) {
	const titles = contents.toString().split("\n")
	titles.forEach(title => {
		console.log(title)
		const socket = {
			user: {
				id: 0
			},
			join: () => {}
		}
		const pageTags = tagManager.getTags(title)
		socket.pageTags = pageTags
		let room = roomManager.findRoomToJoin(pageTags)

		if (room) {
			roomManager.addSocketToRoom(socket, room.id)
		} else {
			room = roomManager.createRoomForSocket(socket)
		}
	})
})
