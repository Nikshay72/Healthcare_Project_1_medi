// frontend/src/hooks/useAuth.js
import { useState, useEffect } from 'react'
import { onAuthChange, FIREBASE_ENABLED } from '../utils/firebase'

export function useAuth() {
  const [user, setUser]       = useState(null)
  const [loading, setLoading] = useState(FIREBASE_ENABLED) // only wait if Firebase is on

  useEffect(() => {
    if (!FIREBASE_ENABLED) {
      setLoading(false)
      return
    }
    const unsub = onAuthChange((u) => {
      setUser(u)
      setLoading(false)
    })
    return () => { if (unsub) unsub() }
  }, [])

  return { user, loading, isLoggedIn: !!user }
}
