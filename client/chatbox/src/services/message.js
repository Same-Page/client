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
  return axios.post(`${urls.dbAPI}/api/v1/message`, payload)
}
