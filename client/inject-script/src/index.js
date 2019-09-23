import "./index.css"

import React from "react"
import ReactDOM from "react-dom"
import App from "./containers/App"
import * as serviceWorker from "./serviceWorker"



setTimeout(() => {
    // temp and bad solution to remove same page chrome extension
    // wait 1 sec then remove the same page extension
    // It would be better to not mount the App at all when we know
    // there is already a local same page app installed.

    var element = document.getElementById("danmu-extension-root");
    if (element) {
        element.parentNode.removeChild(element)
    }

    const appElement = document.createElement("span")
    appElement.id = "danmu-extension-root"
    document.body.appendChild(appElement)
    
    ReactDOM.render(<App />, appElement)
    
    // If you want your app to work offline and load faster, you can change
    // unregister() to register() below. Note this comes with some pitfalls.
    // Learn more about service workers: http://bit.ly/CRA-PWA
    serviceWorker.unregister()
}, 1000)


