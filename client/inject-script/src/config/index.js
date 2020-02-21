const defaultConfig = {
	tabList: ["discover", "chat", "inbox", "profile", "close"],
	defaultTab: "chat",
	chatModes: ["site", "page", "room"],
	defaultChatView: "site",
	debug: false,
	autoConnect: true,
	socketUrl: "chat-v6.yiyechat.com/prod",
	apiUrl: "https://api-v2.yiyechat.com",
	chatboxSrc: "https://yiyechat.com/extension-v6/"
}

if (process.env.REACT_APP_SP_ENV === "dev") {
	// defaultConfig.socketUrl = "http://localhost:8081"
	// defaultConfig.apiUrl = 'localhost:3000'
	defaultConfig.chatboxSrc = "https://localhost:3000"
}

// TODO: only override attributes, don't replace entire object
window.spConfig = window.spConfig || defaultConfig

export default window.spConfig
