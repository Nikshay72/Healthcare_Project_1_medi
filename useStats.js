// frontend/src/hooks/useStats.js
// Reusable hook: fetches dashboard stats, auto-refreshes every 10s

import { useState, useEffect, useCallback } from 'react'
import { api } from '../utils/api'

export function useStats(autoRefresh = true) {
  const [stats, setStats]   = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError]   = useState(null)

  const fetch = useCallback(async () => {
    try {
      const res = await api.getStats()
      setStats(res.data)
      setError(null)
    } catch (e) {
      setError('Could not load stats.')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetch()
    if (!autoRefresh) return
    const interval = setInterval(fetch, 10000)
    return () => clearInterval(interval)
  }, [fetch, autoRefresh])

  return { stats, loading, error, refresh: fetch }
}
