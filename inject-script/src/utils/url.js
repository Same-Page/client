let _url = window.location.href

export const getUrl = () => {
  return _url
}

export const mockUrl = url => {
  _url = url
}

export const getDomain = () => {
  const url = getUrl()
  let parsedUrl = ""
  try {
    parsedUrl = new URL(url)
  } catch (error) {
    console.error(error)
    return "unknown"
  }
  return parsedUrl.hostname
}
