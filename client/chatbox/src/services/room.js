import axios from "axios"

import urls from "config/urls"

export const getPopularRooms = type => {
  const params = {}
  if (type) {
    params["type"] = type
  }
  // return axios.get(`${urls.socketAPI}/api/popular_rooms`)
  return axios.get("https://api-v3.yiyechat.com/api/room", {
    params: params
  })
}

export const createRoom = payload => {
  const formData = new FormData()
  Object.keys(payload).forEach(key => {
    formData.append(key, payload[key])
  })
  return axios.post(urls.dbAPI + "/api/v1/create_room", formData)
}
