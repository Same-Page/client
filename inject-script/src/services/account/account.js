import axios from "axios"

import storage from "storage.js"
import socketManager from "services/socket"
import { apiUrl } from "config/urls"

let _account = null
let _initialized = false

const loginUser = (values, cb) => {
	const payload = {
		userId: values.userId,
		password: values.password
	}
	const url = apiUrl + "/api/v1/login"

	// can't make ajax call in content script since chrome 73
	// proxy through background script
	if (window.chrome && window.chrome.extension) {
		window.chrome.runtime.sendMessage(
			{
				makeRequest: true,
				url: url,
				options: {
					method: "POST",
					headers: {
						"Content-Type": "application/json"
					},
					body: JSON.stringify(payload)
				}
			},
			response => {
				if (response.ok) {
					const account = response.data
					storage.set("account", account)
					cb(account)
				} else {
					console.error(response)
				}
			}
		)
	} else {
		axios
			.post(url, payload)
			.then(res => {
				const account = res.data
				storage.set("account", account)
				cb(account)
			})
			.catch(err => {
				console.error(err)
			})
			.then(res => {})
	}
}

const accountManager = {
	init: cb => {
		if (_initialized) {
			console.error("accountManager already initialized")
			return
		}
		storage.get("account", account => {
			// Check if account in storage, if not
			// check if login in storage then try to login
			_account = account
			if (cb) {
				cb(account)
			}
			if (!_account) {
				storage.get("login", values => {
					if (values) {
						window.spDebug("found login in storage")
						window.spDebug("auto login")
						loginUser(values, cb)
					}
					// else {
					// 	window.spDebug(
					// 		"no login found in storage, use visitor accout"
					// 	)

					// 	// Use a visitor account
					// 	// Once user open chat box, visitor account should be wiped
					// 	_account = {
					// 		name: "visitor",
					// 		id: -1,
					// 		isVisitor: true
					// 	}
					// 	socketManager.connect()
					// }
				})
			}
		})
		storage.addEventListener("account", account => {
			const login = !_account && account
			const logout = _account && !account
			const oldAccount = _account
			_account = account

			if (login) {
				window.spDebug("[Inject account.js] logged in")
				// axios.defaults.headers.common["token"] = this.state.account.token
				if (window.autoConnect || window.createChatboxIframe) {
					socketManager.connect(true)
				}
			} else if (logout) {
				window.spDebug("[Inject account.js] logged out")
				// axios.defaults.headers.common["token"] = null
				socketManager.disconnect()
			} else {
				// Neither login nor logout means updating account info"
				if (account && oldAccount.id !== account.id) {
					console.error(
						"changed account without logging out, impossible"
					)
					socketManager.disconnect()
					socketManager.connect(true)
				}
			}
		})
	},
	getAccount: () => {
		return _account
	},
	loggedIn: () => {
		return !!_account
	},
	logout: () => {
		storage.set("account", null)
	}
}

export default accountManager
window.spAccountManager = accountManager
