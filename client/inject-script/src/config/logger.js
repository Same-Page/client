const spDebug = str => {
	if (window.spConfig && window.spConfig.debug) {
		console.debug(str);
	}
};
window.spDebug = spDebug;
export default spDebug;
