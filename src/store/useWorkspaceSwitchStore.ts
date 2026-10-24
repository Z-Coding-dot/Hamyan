import { create } from 'zustand'

export type WorkspaceSwitchTarget = {
  kind: 'user' | 'company'
  name: string
  imageUrl: string | null
  companyId?: string
}

type WorkspaceSwitchStore = {
  isActive: boolean
  target: WorkspaceSwitchTarget | null
  begin: (target: WorkspaceSwitchTarget) => void
  end: () => void
}

export const useWorkspaceSwitchStore = create<WorkspaceSwitchStore>((set) => ({
  isActive: false,
  target: null,
  begin: (target) => set({ isActive: true, target }),
  end: () => set({ isActive: false, target: null }),
}))
