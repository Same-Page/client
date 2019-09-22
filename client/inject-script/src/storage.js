const storage = {
  get: (key, callback) => {
    if (window.chrome && window.chrome.storage) {
      window.chrome.storage.local.get(key, item => {
        if (key in item) {
          callback(item[key])
        } else {
          callback(null)
        }
      })
    } else {
      if (localStorage.hasOwnProperty(key)) {
        callback(JSON.parse(localStorage.getItem(key)))
      } else {
        callback(null)
      }
    }
  },
  set: (key, value) => {
    if (window.chrome && window.chrome.storage) {
      var item = {}
      item[key] = value
      window.chrome.storage.local.set(item)
    } else {
      const stringValue = JSON.stringify(value)
      localStorage.setItem(key, stringValue)
      // localstorage event isn't triggered on same tab
      // manually create an event and dispatch it
      const storageEvent = document.createEvent("HTMLEvents")
      storageEvent.initEvent("storage", true, true)
      storageEvent.eventName = "storage"
      storageEvent.key = key
      storageEvent.newValue = stringValue
      window.dispatchEvent(storageEvent)
    }
  },
  addEventListener: (key, callback) => {
    if (window.chrome && window.chrome.storage) {
      window.chrome.storage.onChanged.addListener((changes, area) => {
        if (key in changes) {
          console.debug(changes[key])
          callback(changes[key]["newValue"])
        }
      })
    } else {
      window.addEventListener("storage", storageEvent => {
        // key;          // name of the property set, changed etc.
        // oldValue;     // old value of property before change
        // newValue;     // new value of property after change
        // url;          // url of page that made the change
        // storageArea;  // localStorage or sessionStorage,
        // depending on where the change happened.
        if (storageEvent.key === key) {
          callback(JSON.parse(storageEvent.newValue))
        }
      })
    }
  }
}

export default storage
