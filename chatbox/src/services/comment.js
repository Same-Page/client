import axios from "axios"

import urls from "config/urls"

export const getLatestComments = () => {
  return axios.get(`${urls.dbAPI}/api/v1/latest_comments`)
}
