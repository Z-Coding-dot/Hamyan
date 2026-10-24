import { create } from 'zustand'

type ToastTone = 'success' | 'error'

type ToastState = {
  show: boolean
  message: string
  durationMs: number
  tone: ToastTone
  showSuccess: (message: string, durationMs?: number) => void
  showError: (message: string, durationMs?: number) => void
  hideToast: () => void
}

const DEFAULT_DURATION_MS = 3200
const ERROR_DURATION_MS = 4200

export const useToastStore = create<ToastState>((set) => ({
  show: false,
  message: '',
  durationMs: DEFAULT_DURATION_MS,
  tone: 'success',
  showSuccess: (message, durationMs = DEFAULT_DURATION_MS) => {
    if (!message) return
    set({ show: true, message, durationMs, tone: 'success' })
  },
  showError: (message, durationMs = ERROR_DURATION_MS) => {
    if (!message) return
    set({ show: true, message, durationMs, tone: 'error' })
  },
  hideToast: () => set({ show: false, message: '' }),
}))
