import axios from "axios"
import moment from "moment"

import { IntlProvider, createIntl } from "react-intl"
import msg_zh from "i18n/zh.json"
import msg_en from "i18n/en.json"
import React from "react"
import { Icon, message } from "antd"
import { connect } from "react-redux"

import Tab from "containers/Tab"

// import socketManager from "socket/socket"
import storageManager from "utils/storage"
import urls from "config/urls"
import {
  changeChatView,
  setChatModes,
  joinManMadeRoom
} from "redux/actions/chat"
import { changeTab, setAccount, setBlacklist } from "redux/actions"
import store from "redux/store"

// import { setPageTitle, getPageTitle } from "utils/pageTitle"

require("moment/locale/zh-cn") //moment.js bug, has to manually include

const i18nMsg = {
  zh: msg_zh,
  en: msg_en
}
const locale = window.navigator.userLanguage || window.navigator.language
const msg = i18nMsg[locale.substring(0, 2)]

const intl = createIntl({
  locale: locale,
  messages: msg
})

class App extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      // account: null,
      // A few steps before mounting the app
      // 1. Check local/chrome storage to see if there's account data
      // , if so, mount the app.
      // 2. If no account in storage, check if there's credential data
      // in storage, if so, mount the app and auto login
      // 3. If neither account nor credential data is in storage,
      // mount the app and auto register

      // TODO: remove 1 and 2?

      // In short, do not mount until done loading account/credential
      // from storage

      // above comment needs update
      loadingAccountFromStorage: true,
      waitingForConfigFromParent: true,
      // Only if there is no account data in storage on page load
      // autoLogin only once per page load
      autoLogin: false
      //   mode: null,
      //   room: null,
      //   realRoom: DEFAULT_REAL_ROOM
    }
    // if (locale.indexOf("zh") > -1) {
    //   moment.locale("zh-cn")
    // }
    moment.locale(locale)
    // window.spDebug(locale)
    message.config({
      top: 80,
      duration: 2,
      maxCount: 3
    })
  }

  componentDidMount() {
    // TODO: this componentDidMount is registering a
    // couple different things, maybe move them to dedicated module

    // General settings for ajax calls
    axios.interceptors.response.use(
      response => {
        // Do something with response data
        return response
      },
      error => {
        let errorMessage = "出错了"
        // set account to null when we receive 401
        if (error.response && error.response.status === 401) {
          storageManager.set("account", null)

          errorMessage = intl.formatMessage({ id: "not.login" })
        }
        if (
          error.response &&
          error.response.data &&
          error.response.data.error
        ) {
          errorMessage = error.response.data.error
        }
        if (error.response && error.response.status === 403) {
          errorMessage = "禁止通行"
        }
        if (error.response && error.response.status === 409) {
          errorMessage = "权限不足"
        }
        if (error.response && error.response.status === 413) {
          errorMessage = "文件太大"
        }
        if (error.response && error.response.status === 429) {
          errorMessage = "操作频繁，请稍后再试"
        }
        if (error.response && error.response.status === 402) {
          errorMessage = "积分不足"
        }

        message.error(errorMessage)
        console.error(error)
        return Promise.reject(error)
      }
    )
    // storageManager.get("mode", mode => {
    //   if (mode) {
    //     this.setState({ mode: mode })
    //   }
    // })

    if (window.parent && window.parent !== window) {
      window.parent.postMessage({ action: "sp-parent-data" }, "*")
      // storageManager.pushToParentWindow()
      // shouldn't need to push to parent on chatbox load
      // should pull from parent instead
    } else {
      window.spConfig = {}
      this.setState({ waitingForConfigFromParent: false })
      console.error("no parent window, this won't work without config!")
    }

    // storageManager.get("realRoom", realRoom => {
    //   if (realRoom) {
    //     this.setState({ realRoom: realRoom })
    //   }
    // })

    // console.log("get account from storage, register account change listener")
    storageManager.get("room", room => {
      if (room) {
        this.props.joinManMadeRoom(room)
      }
    })

    storageManager.get("account", account => {
      if (account) {
        window.spDebug("found account in storage")
        // window.spDebug(account)
        this.props.setAccount(account)
      } else {
        this.setState({ autoLogin: true })
        window.spDebug("no account found in storage")
      }
      this.setState({ loadingAccountFromStorage: false })
    })
    storageManager.addEventListener("account", account => {
      this.props.setAccount(account)
    })
    storageManager.get("blacklist", blacklist => {
      // simple implementation for blacklist, it's per browser device
      // not per account...
      blacklist = blacklist || []
      this.props.setBlacklist(blacklist)
    })
    storageManager.addEventListener("blacklist", blacklist => {
      this.props.setBlacklist(blacklist)
    })
    window.addEventListener(
      "message",
      e => {
        if (e && e.data && e.data.type === "sp-parent-data") {
          const data = e.data.data

          const spConfig = data.spConfig
          window.spConfig = spConfig
          urls.dbAPI = spConfig.apiUrl || urls.dbAPI
          urls.socketAPI = spConfig.socketUrl || urls.socketAPI

          store.dispatch(setChatModes(spConfig.chatModes))
          spConfig.defaultChatView =
            spConfig.defaultChatView || spConfig.chatModes[0]
          store.dispatch(changeChatView(spConfig.defaultChatView))
          store.dispatch(changeTab(spConfig.defaultTab))
          if (data.account) {
            storageManager.set("account", data.account)
          }

          this.setState({ waitingForConfigFromParent: false })
        }
      },
      false
    )
  }

  componentDidUpdate(prevProps, prevState, snapshot) {
    // Need to differentiate login/logout with profile info update
    // maybe shouldn't have grouped them in one object?
    // const login = !prevState.account && this.state.account
    // const logout = prevState.account && !this.state.account
    // if (login) {
    //   window.spDebug("logged in")
    //   axios.defaults.headers.common["token"] = this.state.account.token
    // }
    // if (logout) {
    //   window.spDebug("logged out")
    //   axios.defaults.headers.common["token"] = null
    //   // clear storage
    //   storageManager.set("unread", false)
    //   storageManager.set("inbox", null)
    //   storageManager.set("inbox-offset", 0)
    //   // TODO:  change tab?
    // }
  }

  // setAccount = account => {
  //   // window.spDebug("set account")
  //   storageManager.set("account", account)
  // }

  stopAutoLogin = () => {
    this.setState({ autoLogin: false })
  }

  render() {
    if (
      this.state.loadingAccountFromStorage ||
      this.state.waitingForConfigFromParent
    ) {
      return (
        <center>
          <Icon style={{ marginTop: "50%" }} type="loading" />
        </center>
      )
    }
    // if (!this.props.account) {
    //   tab = "account"
    // }
    return (
      <IntlProvider locale={locale} messages={msg}>
        <Tab />
      </IntlProvider>
    )
  }
}

// export default App
const stateToProps = state => {
  return {
    account: state.account
  }
}
export default connect(stateToProps, {
  setAccount,
  joinManMadeRoom,
  setBlacklist
})(App)
