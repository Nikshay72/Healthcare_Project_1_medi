import React, { useEffect, useState } from 'react'
import { api } from '../utils/api'
import { listenEmergencies } from '../utils/firebase'

export default function EmergencyLog() {
  const [emergencies, setEmergencies] = useState([])
  const [loading, setLoading] = useState(true)
  const [source, setSource] = useState('api') // 'api' | 'firestore'

  useEffect(() => {
    // Try Firestore real-time listener first (works when .env is configured)
    try {
      const unsub = listenEmergencies((rows) => {
        if (rows.length > 0) {
          setEmergencies(rows)
          setSource('firestore')
          setLoading(false)
        }
      })
      // Fallback: if Firestore returns nothing after 2s, poll the REST API
      const fallbackTimer = setTimeout(async () => {
        if (emergencies.length === 0) {
          try {
            const res = await api.getEmergencies()
            setEmergencies(res.data)
            setSource('api')
          } catch (_) {}
          setLoading(false)
        }
      }, 2000)
      return () => { unsub(); clearTimeout(fallbackTimer) }
    } catch (_) {
      // Firebase not configured — fall back to REST polling
      const poll = async () => {
        try {
          const res = await api.getEmergencies()
          setEmergencies(res.data)
        } catch (_) {}
        setLoading(false)
      }
      poll()
      const interval = setInterval(poll, 10000)
      return () => clearInterval(interval)
    }
  }, [])

  const severityColor = {
    Critical: 'red',
    High: 'amber',
    Medium: 'blue',
    Low: 'green',
  }

  if (loading) return <div className="loading-wrap"><div className="spinner" />Loading log...</div>

  return (
    <div>
      <div className="page-header">
        <h1>📋 Emergency Log</h1>
        <p>
          Recent emergency dispatches&nbsp;
          {source === 'firestore'
            ? '— 🔴 Live (Firestore real-time)'
            : '— auto-refreshes every 10 seconds'}
        </p>
      </div>

      {emergencies.length === 0 ? (
        <div className="card">
          <div className="card-body" style={{ textAlign: 'center', padding: 60, color: 'var(--text3)' }}>
            <div style={{ fontSize: 48, marginBottom: 12 }}>📋</div>
            <div style={{ fontWeight: 700, marginBottom: 6 }}>No emergencies yet</div>
            <div style={{ fontSize: 12 }}>Use the Emergency Router to log dispatches</div>
          </div>
        </div>
      ) : (
        <div className="card">
          <div className="card-header">
            <span>🚨</span>
            <h2>Recent Dispatches</h2>
            <span className="badge green">{emergencies.length} records</span>
          </div>
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Emergency ID</th>
                  <th>Condition</th>
                  <th>Severity</th>
                  <th>Dispatched To</th>
                  <th>Time</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {emergencies.map(e => (
                  <tr key={e.id}>
                    <td>
                      <code style={{ background: 'var(--primary-l)', color: 'var(--primary)', padding: '2px 8px', borderRadius: 4, fontSize: 12 }}>
                        {e.id}
                      </code>
                    </td>
                    <td style={{ fontWeight: 600 }}>{e.condition}</td>
                    <td>
                      <span className={`badge ${severityColor[e.severity] || 'blue'}`}>
                        {e.severity}
                      </span>
                    </td>
                    <td style={{ fontSize: 12, maxWidth: 220 }}>{e.hospital}</td>
                    <td style={{ fontSize: 12, color: 'var(--text3)', fontFamily: 'monospace' }}>{e.time}</td>
                    <td>
                      <span className={`badge ${e.status === 'Dispatched' ? 'green' : 'amber'}`}>
                        {e.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}
