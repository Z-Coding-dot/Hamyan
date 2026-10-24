import { useCallback, useEffect, useRef, useState } from 'react'
import { useLocation, useNavigate, useNavigationType } from 'react-router-dom'

import { useRouteRefreshStore } from '@/store/useRouteRefreshStore'

export function useAppNavigation() {
  const navigate = useNavigate()
  const location = useLocation()
  const navigationType = useNavigationType()
  const stackRef = useRef([location.key])
  const indexRef = useRef(0)
  const [canBack, setCanBack] = useState(false)
  const [canForward, setCanForward] = useState(false)
  const softRefresh = useRouteRefreshStore((state) => state.refresh)

  useEffect(() => {
    const stack = stackRef.current

    if (navigationType === 'POP') {
      const nextIndex = stack.indexOf(location.key)
      if (nextIndex >= 0) {
        indexRef.current = nextIndex
      }
    } else if (navigationType === 'PUSH') {
      stackRef.current = stack.slice(0, indexRef.current + 1).concat(location.key)
      indexRef.current = stackRef.current.length - 1
    } else if (navigationType === 'REPLACE') {
      stackRef.current = [...stack.slice(0, indexRef.current), location.key]
    }

    setCanBack(indexRef.current > 0)
    setCanForward(indexRef.current < stackRef.current.length - 1)
  }, [location.key, navigationType])

  const back = useCallback(() => {
    if (indexRef.current > 0) {
      navigate(-1)
    }
  }, [navigate])

  const forward = useCallback(() => {
    if (indexRef.current < stackRef.current.length - 1) {
      navigate(1)
    }
  }, [navigate])

  const refresh = useCallback(() => {
    softRefresh()
  }, [softRefresh])

  return { canBack, canForward, back, forward, refresh }
}
