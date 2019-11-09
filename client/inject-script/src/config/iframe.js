// localhost and web version should have everything the same
// except for iframe src url
import spConfig from "config"
const localhostUrl = "localhost:3210"
const localChatboxUrl = "http://localhost:3000"
const remoteChatboxUrl =
  spConfig.chatboxUrl || "https://yiyechat.com/open-source/build/index.html"

const localOrWeb =
  window.location.href.indexOf(localhostUrl) > -1 ||
  window.location.href.indexOf("yiyechat.com/build/index.html") > -1

// export const createIframeByDefault = localOrWeb ? true : false
export const createIframeByDefault = false
// If content script is running on localhost, use local iframe
// We can also force using local iframe even for extension

let useLocalIframe = window.location.href.indexOf(localhostUrl) > -1
// useLocalIframe = false

const iframeSrc = useLocalIframe ? localChatboxUrl : remoteChatboxUrl
export { iframeSrc }

// mimic iframe control
export const showIframeControl = localOrWeb

export const iframeSize = {
  width: 330,
  height: 450,
  minWidth: 35,
  minHeight: 75
}
