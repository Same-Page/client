const defaultConfig = {
	tabList: ["discover", "chat", "inbox", "profile", "close"],
	defaultTab: "chat",
	chatModes: ["site", "page", "room"],
	defaultChatView: "site",
	debug: true,
	socketUrl: "chat-v6.yiyechat.com/prod",
	apiUrl: "https://api-v2.yiyechat.com",
	// apiUrl: "http://localhost:8080",
	chatboxSrc: "https://yiyechat.com/extension-v6/",

	autoConnect: false,
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

// TODO: only override attributes, don't replace entire object
window.spConfig = window.spConfig || defaultConfig

export default window.spConfig
