import { useLocalAPI, useLocalSocket } from "./index"

const urls = {
  debugMsgSrc: "http://localhost:9009",
  dbAPI: "https://api-v2.yiyechat.com",
  // used to get pop rooms
  socketAPI: "https://chat.yiyechat.com"
}

if (useLocalAPI) urls.dbAPI = "http://localhost:8080"
if (useLocalSocket) urls.socketAPI = "http://localhost:8081"

export default urls
