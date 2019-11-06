 let apiUrl = "https://api-v2.yiyechat.com"
 let socketUrl = "https://chat.yiyechat.com"
alert(process.env.REACT_APP_SP_ENV)
if (process.env.REACT_APP_SP_ENV === 'dev') {
    apiUrl = "http://localhost:8080"
    socketUrl = "http://localhost:8081"
}

const stickersUrl = "https://yiyechat.com/build/chatbox/"

export {apiUrl, socketUrl, stickersUrl}
