export const postMsgToIframe = (type, data) => {
	// Iframe isn't mounted until user click
	if (window.chatboxIframeRef && window.chatboxIframeRef.current) {
		window.chatboxIframeRef.current.contentWindow.postMessage(
			{
				data: data,
				type: type
				// name: name
			},
			"*"
		)
	}
}
