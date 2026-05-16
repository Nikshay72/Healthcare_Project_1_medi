// frontend/src/hooks/useHospitals.js
// Fetches hospitals from Flask API, then overlays real-time Firebase bed updates

import { useState, useEffect, useCallback } from 'react'
import { api } from '../utils/api'
import { db, FIREBASE_ENABLED } from '../utils/firebase'

export function useHospitals(autoRefresh = true) {
  const [hospitals, setHospitals]     = useState([])
  const [loading, setLoading]         = useState(true)
  const [error, setError]             = useState(null)
  const [lastUpdated, setLastUpdated] = useState(null)

  const fetch = useCallback(async () => {
    try {
      const res = await api.getHospitals()
      setHospitals(res.data)
      setLastUpdated(new Date())
      setError(null)
    } catch (e) {
      setError('Failed to load hospitals. Is the backend running?')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetch()
    if (!autoRefresh) return
    const interval = setInterval(fetch, 15000)
    return () => clearInterval(interval)
  }, [fetch, autoRefresh])

  // ── Firebase real-time overlay ───────────────────────────────────────────
  // When a hospital staff member updates beds, this fires immediately
  useEffect(() => {
    if (!FIREBASE_ENABLED || !db) return
    let unsub = () => {}
    import('firebase/firestore').then(({ collection, onSnapshot }) => {
      unsub = onSnapshot(collection(db, 'hospitals'), (snap) => {
        if (snap.empty) return
        const fbUpdates = {}
        snap.docs.forEach(d => {
          fbUpdates[d.id] = d.data()
        })
        setHospitals(prev => prev.map(h => {
          const update = fbUpdates[String(h.id)]
          if (!update) return h
          return {
            ...h,
            available_beds:   update.available_beds   ?? h.available_beds,
            icu_available:    update.icu_available    ?? h.icu_available,
            trauma_available: update.trauma_available ?? h.trauma_available,
            burn_available:   update.burn_available   ?? h.burn_available,
            er_wait_min:      update.er_wait_min      ?? h.er_wait_min,
            status:           update.status           ?? h.status,
          }
        }))
      })
    })
    return () => unsub()
  }, [])

  return { hospitals, loading, error, lastUpdated, refresh: fetch }
}
