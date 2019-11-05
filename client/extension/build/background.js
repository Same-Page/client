chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
    if (request.clearIcon) {
        chrome.browserAction.setBadgeText({text: ''});
    }

});