import axios from "axios"

import urls from "config/urls"

export const getLatestDanmus = () => {
  return axios.get(`${urls.dbAPI}/api/v1/latest_danmus`)
}
