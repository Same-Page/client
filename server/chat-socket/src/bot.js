"use strict";
const NodeCache = require( "node-cache" );
const botsCache = new NodeCache( { stdTTL: 5*60, checkperiod: 120 } );

var utils = require('./utils.js');

var messages = [
	'Is anyone here?',
	'LOL',
	'Hi there, small world!',
	"Wow, this is cooool!",
	'Hey, how are you!'
]
var botLinda = {username: 'Linda', userId: 'bot-linda'}
var botEva = {username: '明日香', userId: 'bot-eva'}
var botOlivia = {username: 'Olivia', userId: 'bot-olivia'}
var botRach = {username: 'Rach', userId: 'bot-rach'}
var botSarah = {username: 'Sarah', userId: 'bot-sarah'}

var popularSites = {
	'localhost:8080': [botSarah, botEva, botLinda, botOlivia, botRach],
	// 'google.com': [botSarah, botRach],
	// 'baidu.com': [botEva, botLinda],
	// 'youtube.com': [botEva, botOlivia],
	// 'hulu.com': [botSarah, botOlivia],
	// 'bilibili.com': [botEva, botLinda],
	// 'douban.com': [botEva, botLinda],
	// 'facebook.com': [botRach, botSarah],
}

var chatbot = {}

function sendMsgByRandomBot(socket) {
	if (!socket) return;
	var randMsgIndex = Math.floor(Math.random() * messages.length);
	var msg = messages[randMsgIndex];
	var userId = 'bot-' + Math.floor(Math.random() * 100);
	socket.emit('new message', {
		username: '',
		message: msg,
		sender: userId
	});
}
chatbot.sendMsgByRandomBot = sendMsgByRandomBot;

function getBotsForPopularRoom(roomId) {
	var url = roomId.replace('https://','').replace('http://','').replace('www.','').replace('/','');
	if ( url in popularSites ) {
		var cacheRes = botsCache.get(url);
		if ( cacheRes == undefined ){
			var bots = popularSites[url];
			bots = JSON.parse(JSON.stringify(bots));
			// random bot
			var randBotNum = Math.floor(Math.random()*2);
			var i = 0;
			for(; i<randBotNum; i++) {
				bots.push({username: '', userId: 'bot-' + Math.floor(Math.random() * 100)});
			}
			botsCache.set(url, bots);
			return bots;
		} else {
			return cacheRes;
		}
	}
	return [];
}
chatbot.getBotsForPopularRoom = getBotsForPopularRoom;


module.exports = chatbot;