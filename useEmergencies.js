// frontend/src/hooks/useEmergencies.js
// Real-time emergency log — Firestore listener when configured, REST fallback otherwise

import { useState, useEffect } from 'react'
import { api } from '../utils/api'
import { listenEmergencies } from '../utils/firebase'

export function useEmergencies() {
  const [emergencies, setEmergencies] = useState([])
  const [loading, setLoading]         = useState(true)
  const [source, setSource]           = useState('api') // 'api' | 'firestore'

  useEffect(() => {
    let restInterval = null
    let firestoreUnsub = null

    const startRestPolling = () => {
      const poll = async () => {
        try {
          const res = await api.getEmergencies()
          setEmergencies(res.data)
          setSource('api')
        } catch (_) {}
        setLoading(false)
      }
      poll()
      restInterval = setInterval(poll, 10000)
    }

    try {
      firestoreUnsub = listenEmergencies((rows) => {
        setEmergencies(rows)
        setSource('firestore')
        setLoading(false)
      })

      // If Firestore returns nothing in 2.5s, fall back to REST
      const timer = setTimeout(() => {
        if (emergencies.length === 0) startRestPolling()
      }, 2500)

      return () => {
        clearTimeout(timer)
        if (firestoreUnsub) firestoreUnsub()
        if (restInterval)   clearInterval(restInterval)
      }
    } catch (_) {
      // Firebase not configured
      startRestPolling()
      return () => { if (restInterval) clearInterval(restInterval) }
    }
  }, [])

  return { emergencies, loading, source }
}
