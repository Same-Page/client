import axios from "axios"

import urls from "config/urls"

export const getUser = userId => {
  return axios.get(`${urls.dbAPI}/api/v1/user/${userId}`)
}

export const getLatestUsers = () => {
  return axios.get(`${urls.dbAPI}/api/v1/latest_users`)
}

export const updateUser = payload => {
  const formData = new FormData()
  formData.append("name", payload.name)
  formData.append("about", payload.about)
  if (payload.avatar) {
    formData.append("avatar", payload.avatar, "avatar")
  }
  return axios.post(urls.dbAPI + "/api/v1/user", formData)
}

export const blockUser = userId => {
  const payload = {
    userId: userId
  }
  return axios.post(urls.dbAPI + "/api/v1/block_user", payload)
}

export const unblockUser = userId => {
  const payload = {
    userId: userId
  }
  return axios.post(urls.dbAPI + "/api/v1/unblock_user", payload)
}

export const thankUser = userId => {
  const payload = {
    userId: userId
  }
  return axios.post(urls.dbAPI + "/api/v1/thank_user", payload)
}
