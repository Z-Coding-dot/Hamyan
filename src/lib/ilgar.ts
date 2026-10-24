import { api } from '@/lib/api'
import { ILGAR_MESSAGES_URL, openExternalUrl } from '@/lib/whatsapp'

/** Open Ilgar messenger; when a Sanctum token is available, auto-sign-in via one-time bridge code. */
export async function openIlgarMessenger(token?: string | null): Promise<void> {
  if (!token) {
    openExternalUrl(ILGAR_MESSAGES_URL)
    return
  }

  try {
    const response = await api.post<{ code: string }>(
      '/auth/app-bridge',
      { app: 'ilgar' },
      { headers: { Authorization: `Bearer ${token}` } },
    )
    const code = response.data?.code
    if (!code) {
      openExternalUrl(ILGAR_MESSAGES_URL)
      return
    }
    openExternalUrl(`${ILGAR_MESSAGES_URL}/auth/bridge?code=${encodeURIComponent(code)}`)
  } catch {
    openExternalUrl(ILGAR_MESSAGES_URL)
  }
}
