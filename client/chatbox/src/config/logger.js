const spDebug = (str) => {
    if (window.spConfig.debug) {
        console.debug(str)
    }
}
window.spDebug = spDebug
export default spDebug