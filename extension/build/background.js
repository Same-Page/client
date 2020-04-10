chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
    if (request.clearIcon) {
        chrome.browserAction.setBadgeText({ text: "" })
    } else if (request.makeRequest) {
        fetch(request.url, request.options)
            .then(response => response.json())
            .then(data => {
                sendResponse({
                    ok: true,
                    data: data
                })
                console.log(data)
            })
            .catch(error => {
                sendResponse({
                    data: error,
                    ok: false
                })
                console.error("Error:", error)
            })

        // fetch(request.url, request.options).then(
        //     function(response) {

        //         return response.text().then(function(text) {
        //             sendResponse([
        //                 {
        //                     body: text,
        //                     status: response.status,
        //                     statusText: response.statusText
        //                 },
        //                 null
        //             ])
        //         })
        //     },
        //     function(error) {
        //         sendResponse([null, error])
        //     }
        // )
        return true
    }
}) 
