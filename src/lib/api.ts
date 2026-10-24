import axios from 'axios'

import { apiBaseUrl } from '@/lib/config'
import i18n from '@/lib/i18n'
import { isLocalApiBase, isOnline, OfflineError } from '@/lib/network'
import { useOnlineStatusStore } from '@/store/useOnlineStatusStore'
import { useToastStore } from '@/store/useToastStore'

const MUTATING_METHODS = new Set(['post', 'put', 'patch', 'delete'])

export const api = axios.create({
  baseURL: apiBaseUrl,
  headers: {
    Accept: 'application/json',
    'Content-Type': 'application/json',
  },
  timeout: 20000,
})

api.interceptors.request.use((config) => {
  const online = isOnline()
  useOnlineStatusStore.getState().setOnline(online)

  const language = (i18n.language || 'fa').slice(0, 2)
  config.headers = config.headers ?? {}
  config.headers['Accept-Language'] = language

  if (online) return config

  const method = String(config.method || 'get').toLowerCase()
  if (MUTATING_METHODS.has(method)) {
    useToastStore.getState().showError(i18n.t('desktop.offline_operation_blocked'))
  }

  return Promise.reject(new OfflineError())
})

api.interceptors.response.use(
  (response) => {
    useOnlineStatusStore.getState().setOnline(true)
    return response
  },
  (error) => {
    if (
      axios.isAxiosError(error) &&
      !error.response &&
      error.code === 'ERR_NETWORK' &&
      !isLocalApiBase()
    ) {
      useOnlineStatusStore.getState().setOnline(false)
    }
    return Promise.reject(error)
  },
)
