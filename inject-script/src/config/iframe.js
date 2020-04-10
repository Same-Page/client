import spConfig from "config"

// TODO: chrome extension popup.html should be able to set this
export const createIframeByDefault = false

const iframeSrc = spConfig.chatboxSrc
export { iframeSrc }

// mimic iframe control
export const showIframeControl =
	window.location.href.indexOf("localhost:3210") > -1

export const defaultIframeSize = {
	width: 350,
	height: 500,
	minWidth: 275,
	minHeight: 110
}
