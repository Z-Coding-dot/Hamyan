async function withFallbackStorage() {
  return {
    setItem: async (key: string, value: string) => {
      localStorage.setItem(key, value)
    },
    getItem: async (key: string) => localStorage.getItem(key),
    deleteItem: async (key: string) => {
      localStorage.removeItem(key)
    },
  }
}

export async function setSessionItem(key: string, value: string): Promise<void> {
  const session = await withFallbackStorage()
  await session.setItem(key, value)
}

export async function getSessionItem(key: string): Promise<string | null> {
  const session = await withFallbackStorage()
  return session.getItem(key)
}

export async function deleteSessionItem(key: string): Promise<void> {
  const session = await withFallbackStorage()
  await session.deleteItem(key)
}
