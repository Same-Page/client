const defaultConfig = {
	tabList: ["discover", "chat", "inbox", "profile", "close"],
	defaultTab: "chat",
	chatModes: ["site", "page", "room"],
	defaultChatView: "site",
	debug: false,
	socketUrl: "chat-v6.yiyechat.com/prod",
	// for getting data from chat cache
	chatApi: "https://api-v3.yiyechat.com",
	apiUrl: "https://api-v2.yiyechat.com",
	// apiUrl: "http://localhost:8080",
	chatboxSrc: "https://yiyechat.com/extension-v6/",

	autoConnect: false,
	showDanmu: true,
	showAvatars: true
}

if (process.env.REACT_APP_LOCAL_CHATBOX) {
	// defaultConfig.socketUrl = "http://localhost:8081"
	// defaultConfig.apiUrl = 'localhost:3000'
	defaultConfig.chatboxSrc = "https://localhost:3000"
}
if (process.env.REACT_APP_LOCAL_SOCKET) {
	defaultConfig.socketUrl = "localhost:8765"
}

let spConfig = { ...defaultConfig }
if (window.spConfig) {
	console.log(window.spConfig)
	spConfig = { ...defaultConfig, ...window.spConfig }
	console.log(spConfig)
}
window.spConfig = spConfig

export default spConfig
