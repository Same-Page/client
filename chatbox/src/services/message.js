import axios from "axios"

import urls from "config/urls"

export const getMessages = offset => {
  const params = {
    offset: offset
  }
  return axios.get(`${urls.dbAPI}/api/v1/messages`, {
    params: params
  })
}

export const postMessage = (userId, content, offset) => {
  const payload = {
    userId: userId,
    content: content,
    offset: offset
  }
  // TODO: content is in the format of
  // {
  //   value: 'hi there',
  //   type: 'text'
  // }
  // this is useful but api backend hasn't been updated yet
  if (content.type === "text") {
    payload.content = content.text
  }
  if (content.type === "file") {
    payload.content = content.url
  }
  return axios.post(`${urls.dbAPI}/api/v1/message`, payload)
}
