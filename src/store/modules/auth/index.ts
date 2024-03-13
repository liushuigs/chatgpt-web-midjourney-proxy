import { defineStore } from 'pinia'
import { getToken, removeToken, setToken } from './helper'
import { store } from '@/store/helper'
import { fetchSession } from '@/api'
import { gptConfigStore, homeStore } from '@/store/homeStore'
import { useAppStore } from '@/store'
const appStore = useAppStore()
interface SessionResponse {
  theme?: string
  auth: boolean
  model: 'ChatGPTAPI' | 'ChatGPTUnofficialProxyAPI'
  user?: User.UserType | null
}

export interface AuthState {
  token: string | undefined
  session: SessionResponse | null
  user?: User.UserType | null
}

export const useAuthStore = defineStore('auth-store', {
  state: (): AuthState => ({
    token: getToken(),
    session: null,
    user: null,
  }),

  getters: {
    isChatGPTAPI(state): boolean {
      return state.session?.model === 'ChatGPTAPI'
    },
  },

  actions: {
    async getSession() {
      try {
        const { data: all } = await fetchSession<SessionResponse>()
        const { user, ...data } = all
        this.session = { ...data }
        homeStore.setMyData({ session: data, user })
        if (appStore.$state.theme == 'auto')
          appStore.setTheme(data.theme && data.theme == 'light' ? 'light' : 'dark')

        const str = localStorage.getItem('gptConfigStore')
        if (!str)
          setTimeout(() => gptConfigStore.setInit(), 500)
        return Promise.resolve(data)
      }
      catch (error) {
        return Promise.reject(error)
      }
    },

    setToken(token: string) {
      this.token = token
      setToken(token)
    },

    removeToken() {
      this.token = undefined
      removeToken()
    },

    setUser(user: UserType) {
      this.user = user
    },

    removeUser() {
      this.user = null
    },
  },
})

export function useAuthStoreWithout() {
  return useAuthStore(store)
}
