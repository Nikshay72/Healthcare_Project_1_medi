import React, { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { api } from '../utils/api'
import { logEmergency, logAlert } from '../utils/firebase'

const CONDITIONS = ['Cardiac Arrest', 'Trauma / Accident', 'Burns', 'Neurological', 'Kidney Failure', 'General Emergency']
const SEVERITIES = ['Critical', 'High', 'Medium', 'Low']

export default function EmergencyRouter({ onConditionChange, onSeverityChange, onTriggerRoute, onGetLocation }) {
  const [form, setForm] = useState({ lat: 26.292, lng: 73.014, condition: 'General Emergency', severity: 'High' })
  const [result, setResult]   = useState(null)
  const [loading, setLoading] = useState(false)
  const [alertSent, setAlertSent] = useState({})
  const navigate = useNavigate()

  // ── Read voice pre-fill from sessionStorage (set by VoiceAction page) ──────
  useEffect(() => {
    const vc = sessionStorage.getItem('voice_condition')
    const vs = sessionStorage.getItem('voice_severity')
    if (vc) { setForm(p => ({ ...p, condition: vc })); sessionStorage.removeItem('voice_condition') }
    if (vs) { setForm(p => ({ ...p, severity: vs }));  sessionStorage.removeItem('voice_severity') }
  }, [])

  // ── Voice command callbacks (called from VoiceButton) ───────────────────────
  useEffect(() => {
    if (onConditionChange) onConditionChange.current = (c) => setForm(p => ({ ...p, condition: c }))
    if (onSeverityChange)  onSeverityChange.current  = (s) => setForm(p => ({ ...p, severity: s }))
    if (onTriggerRoute)    onTriggerRoute.current    = handleRoute
    if (onGetLocation)     onGetLocation.current     = getUserLocation
  })

  const getUserLocation = () => {
    if (!navigator.geolocation) return
    navigator.geolocation.getCurrentPosition(
      (pos) => setForm(p => ({ ...p, lat: pos.coords.latitude, lng: pos.coords.longitude })),
      () => {}
    )
  }

  const handleRoute = async () => {
    setLoading(true)
    setResult(null)
    try {
      const res = await api.findRoute(form)
      setResult(res.data)
      // Also persist to Firestore (silent fail if Firebase not configured)
      try {
        await logEmergency({
          emergency_id: res.data.emergency_id,
          condition:    form.condition,
          severity:     form.severity,
          hospital:     res.data.recommendations[0]?.hospital?.name || 'N/A',
          hospital_id:  res.data.recommendations[0]?.hospital?.id || null,
          patient_lat:  form.lat,
          patient_lng:  form.lng,
          eta_min:      res.data.recommendations[0]?.eta_min || null,
          distance_km:  res.data.recommendations[0]?.distance_km || null,
          time:         new Date().toLocaleTimeString(),
          status:       'Dispatched',
        })
      } catch (_) {}
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  const handleAlert = async (rec) => {
    const res = await api.sendAlert({
      hospital_id: rec.hospital.id,
      condition: form.condition,
      eta: rec.eta_min,
    })
    setAlertSent(prev => ({ ...prev, [rec.hospital.id]: res.data.message }))
  }

  const rankColors = ['var(--green)', 'var(--blue)', 'var(--amber)', 'var(--text3)', 'var(--text4)', 'var(--text4)']

  return (
    <div>
      <div className="page-header">
        <h1>🚑 Emergency Router</h1>
        <p>Enter patient location and condition — get instant hospital recommendations</p>
      </div>

      <div className="grid-2">
        {/* Form */}
        <div className="card">
          <div className="card-header"><span>📍</span><h2>Patient Details</h2></div>
          <div className="card-body">
            <div className="form-group">
              <label className="form-label">Emergency Condition</label>
              <select className="form-select" value={form.condition} onChange={e => setForm(p => ({...p, condition: e.target.value}))}>
                {CONDITIONS.map(c => <option key={c}>{c}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Severity</label>
              <select className="form-select" value={form.severity} onChange={e => setForm(p => ({...p, severity: e.target.value}))}>
                {SEVERITIES.map(s => <option key={s}>{s}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Patient Location</label>
              <div style={{ display:'flex', gap:8, marginBottom:8 }}>
                <button
                  type="button"
                  className="btn btn-outline btn-sm"
                  onClick={() => {
                    if (!navigator.geolocation) { alert('Geolocation not supported by this browser'); return }
                    navigator.geolocation.getCurrentPosition(
                      (pos) => setForm(p => ({ ...p, lat: parseFloat(pos.coords.latitude.toFixed(5)), lng: parseFloat(pos.coords.longitude.toFixed(5)) })),
                      ()    => alert('Could not get location. Please allow location access.')
                    )
                  }}
                >
                  📍 Use My Live GPS
                </button>
                <span style={{ fontSize:11, color:'var(--text3)', alignSelf:'center' }}>or enter manually below</span>
              </div>
            </div>
            <div className="grid-2">
              <div className="form-group">
                <label className="form-label">Latitude</label>
                <input className="form-input" type="number" step="0.001"
                  value={form.lat} onChange={e => setForm(p => ({...p, lat: parseFloat(e.target.value)}))} />
              </div>
              <div className="form-group">
                <label className="form-label">Longitude</label>
                <input className="form-input" type="number" step="0.001"
                  value={form.lng} onChange={e => setForm(p => ({...p, lng: parseFloat(e.target.value)}))} />
              </div>
            </div>

            <div className="alert alert-info">
              💡 Default coordinates set to central Jodhpur. You can also use the browser's location API to get live GPS.
            </div>

            <button
              className="btn btn-red"
              style={{ width: '100%', padding: '12px', fontSize: 15, marginTop: 4 }}
              onClick={handleRoute}
              disabled={loading}
            >
              {loading ? '⏳ Finding Best Hospitals...' : '🚨 FIND BEST HOSPITAL'}
            </button>
          </div>
        </div>

        {/* Result Panel */}
        <div>
          {!result && !loading && (
            <div className="card">
              <div className="card-body" style={{ textAlign: 'center', padding: 60, color: 'var(--text3)' }}>
                <div style={{ fontSize: 48, marginBottom: 12 }}>🏥</div>
                <div style={{ fontWeight: 700, marginBottom: 6 }}>Ready to Route</div>
                <div style={{ fontSize: 12 }}>Fill in patient details and click Find Best Hospital</div>
              </div>
            </div>
          )}

          {loading && (
            <div className="loading-wrap"><div className="spinner" />Calculating optimal routes...</div>
          )}

          {result && (
            <div>
              <div className="alert alert-success">
                ✅ Emergency ID: <strong>{result.emergency_id}</strong> &nbsp;|&nbsp; {result.timestamp}
              </div>

              {result.recommendations.map((rec, i) => (
                <div key={rec.hospital.id} className={`rec-card rank-${i + 1}`}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                    <div className="rec-rank" style={{ background: rankColors[i], color: '#fff', width: 28, height: 28, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 800 }}>
                      {i + 1}
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 700, fontSize: 14 }}>{rec.hospital.name}</div>
                      <div style={{ fontSize: 11, color: 'var(--text3)' }}>{rec.hospital.address?.split(',')[0]}</div>
                    </div>
                    {rec.recommended && <span className="badge green">✓ Recommended</span>}
                  </div>

                  <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 10 }}>
                    <span className="hstat green">🛏️ {rec.hospital.available_beds} beds</span>
                    <span className="hstat amber">📍 {rec.distance_km} km</span>
                    <span className={`hstat ${rec.eta_min <= 10 ? 'green' : 'amber'}`}>⏱️ ETA {rec.eta_min} min</span>
                    <span className="hstat">🚦 {rec.traffic}</span>
                    <span className="hstat">Score: {rec.score}</span>
                  </div>

                  <div style={{ display: 'flex', gap: 8 }}>
                    <button className="btn btn-red btn-sm" onClick={() => handleAlert(rec)}>
                      🔔 Send Pre-Alert
                    </button>
                    <button className="btn btn-outline btn-sm" onClick={() => navigate(`/hospitals/${rec.hospital.id}`)}>
                      View Details →
                    </button>
                  </div>

                  {alertSent[rec.hospital.id] && (
                    <div className="alert alert-success" style={{ marginTop: 8, marginBottom: 0 }}>
                      {alertSent[rec.hospital.id]}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
