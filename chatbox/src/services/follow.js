import axios from "axios"

import urls from "config/urls"

export const followUser = id => {
  const payload = {
    id: id
  }
  return axios.post(`${urls.dbAPI}/api/v1/follow`, payload)
}
