import { boot } from 'quasar/wrappers'
import axios, { AxiosInstance } from 'axios'

declare module '@vue/runtime-core' {
  interface ComponentCustomProperties {
    $axios: AxiosInstance
  }
}
const api = axios.create({ baseURL: process.env.LADDER_BOT_HOSTNAME as string })

export default boot(() => {
  api.interceptors.request.use(
    function (config) {
      return config
    },
    function (error) {
      console.error(error.message)
    }
  )

  // Réponses
  api.interceptors.response.use(
    function (response) {
      return response
    },
    function (error) {
      if (error.response.status === 404) {
        return Promise.reject(error)
      } else {
        console.error(error)
      }
    }
  )
})

export { api }
