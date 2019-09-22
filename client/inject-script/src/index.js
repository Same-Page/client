import "./index.css"

import React from "react"
import ReactDOM from "react-dom"
import App from "./containers/App"
import * as serviceWorker from "./serviceWorker"

const appElement = document.createElement("span")
appElement.id = "danmu-extension-root"
document.body.appendChild(appElement)

ReactDOM.render(<App />, appElement)

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: http://bit.ly/CRA-PWA
serviceWorker.unregister()
