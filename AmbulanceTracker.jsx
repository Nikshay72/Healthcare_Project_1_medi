import React, { useEffect, useRef, useState } from 'react'
import { api } from '../utils/api'

// ── Load Leaflet from CDN (free, no API key ever) ─────────────────────────────
function loadLeaflet() {
  return new Promise((resolve) => {
    if (window.L) { resolve(window.L); return }

    if (!document.getElementById('leaflet-css')) {
      const link = document.createElement('link')
      link.id   = 'leaflet-css'
      link.rel  = 'stylesheet'
      link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css'
      document.head.appendChild(link)
    }

    if (!document.getElementById('leaflet-js')) {
      const script = document.createElement('script')
      script.id    = 'leaflet-js'
      script.src   = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js'
      script.onload = () => resolve(window.L)
      document.head.appendChild(script)
    } else {
      const wait = setInterval(() => {
        if (window.L) { clearInterval(wait); resolve(window.L) }
      }, 50)
    }
  })
}

const HOSPITALS = [
  { name: 'AIIMS Jodhpur',           lat: 26.248, lng: 73.024, type: 'Government' },
  { name: 'Umaid Hospital (SNMC)',    lat: 26.279, lng: 73.008, type: 'Government' },
  { name: 'Medipulse Hospital',       lat: 26.252, lng: 73.025, type: 'Private' },
  { name: 'Goyal Hospital',           lat: 26.291, lng: 73.032, type: 'Private' },
  { name: 'Shri Ram Hospital',        lat: 26.258, lng: 73.038, type: 'Private' },
  { name: 'Pacific Medical College',  lat: 26.312, lng: 73.048, type: 'Private' },
  { name: 'Mahaveer Cancer Centre',   lat: 26.276, lng: 73.028, type: 'Private' },
  { name: 'Kamla Nagar Hospital',     lat: 26.262, lng: 73.046, type: 'Private' },
  { name: 'Bhandari Hospital',        lat: 26.310, lng: 73.033, type: 'Private' },
  { name: 'Kailash Trauma Centre',    lat: 26.261, lng: 73.048, type: 'Private' },
]

export default function AmbulanceTracker() {
  const [ambulances, setAmbulances]   = useState([])
  const [loading, setLoading]         = useState(true)
  const [selectedAmb, setSelectedAmb] = useState(null)
  const mapRef      = useRef(null)
  const mapInstance = useRef(null)
  const ambMarkers  = useRef([])

  // ── Fetch ambulances ─────────────────────────────────────────────────────────
  const fetchAmbulances = async () => {
    try {
      const res = await api.getAmbulances()
      setAmbulances(res.data)
      setLoading(false)
    } catch { setLoading(false) }
  }

  useEffect(() => {
    fetchAmbulances()
    const interval = setInterval(fetchAmbulances, 8000)
    return () => clearInterval(interval)
  }, [])

  // ── Init Leaflet map once ────────────────────────────────────────────────────
  useEffect(() => {
    if (!mapRef.current || mapInstance.current) return

    loadLeaflet().then((L) => {
      if (mapInstance.current) return

      const map = L.map(mapRef.current, {
        center: [26.2789, 73.0169],
        zoom: 13,
        zoomControl: true,
      })

      // FREE OpenStreetMap tiles — zero cost, no sign-up
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© <a href="https://openstreetmap.org">OpenStreetMap</a>',
        maxZoom: 19,
      }).addTo(map)

      // Hospital pins
      HOSPITALS.forEach(h => {
        const icon = L.divIcon({
          className: '',
          html: `<div style="background:${h.type === 'Government' ? '#22C55E' : '#3B82F6'};color:#fff;width:30px;height:30px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:15px;border:2px solid #fff;box-shadow:0 2px 6px rgba(0,0,0,0.3)">🏥</div>`,
          iconSize: [30, 30],
          iconAnchor: [15, 15],
        })
        L.marker([h.lat, h.lng], { icon })
          .addTo(map)
          .bindPopup(`<b>🏥 ${h.name}</b><br/><small>${h.type} Hospital</small>`)
      })

      mapInstance.current = map
    })

    return () => {
      if (mapInstance.current) {
        mapInstance.current.remove()
        mapInstance.current = null
      }
    }
  }, [])

  // ── Update ambulance markers when data refreshes ─────────────────────────────
  useEffect(() => {
    if (!mapInstance.current || !window.L || !ambulances.length) return
    const L = window.L

    ambMarkers.current.forEach(m => mapInstance.current.removeLayer(m))
    ambMarkers.current = []

    ambulances.forEach(a => {
      const isAvailable = a.status === 'Available'
      const icon = L.divIcon({
        className: '',
        html: `<div style="background:${isAvailable ? '#22C55E' : '#EF4444'};color:#fff;width:34px;height:34px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:17px;border:2px solid #fff;box-shadow:0 2px 8px rgba(0,0,0,0.4)">🚑</div>`,
        iconSize: [34, 34],
        iconAnchor: [17, 17],
      })

      const marker = L.marker([a.lat, a.lng], { icon })
        .addTo(mapInstance.current)
        .bindPopup(`
          <div style="font-family:sans-serif;min-width:150px;padding:4px">
            <b>🚑 ${a.id}</b><br/>
            Driver: ${a.driver}<br/>
            📞 ${a.phone}<br/>
            <span style="color:${isAvailable ? '#16A34A' : '#DC2626'}">● ${a.status}</span>
          </div>
        `)
        .on('click', () => setSelectedAmb(a))

      ambMarkers.current.push(marker)
    })
  }, [ambulances])

  const available = ambulances.filter(a => a.status === 'Available').length
  const onDuty    = ambulances.filter(a => a.status === 'On Duty').length

  if (loading) return <div className="loading-wrap"><div className="spinner" />Loading ambulances...</div>

  return (
    <div>
      <div className="page-header">
        <h1>🗺️ Ambulance Tracker</h1>
        <p>Live map powered by OpenStreetMap — 100% free, no API key needed</p>
      </div>

      {/* Stats row */}
      <div className="stat-grid" style={{ gridTemplateColumns: 'repeat(3,1fr)', marginBottom: 20 }}>
        <div className="stat-card">
          <div className="stat-card-icon" style={{ background: 'var(--green-l)' }}>🚑</div>
          <div className="stat-card-value" style={{ color: 'var(--green)' }}>{available}</div>
          <div className="stat-card-label">Available</div>
        </div>
        <div className="stat-card">
          <div className="stat-card-icon" style={{ background: 'var(--red-l)' }}>🚨</div>
          <div className="stat-card-value" style={{ color: 'var(--red)' }}>{onDuty}</div>
          <div className="stat-card-label">On Duty</div>
        </div>
        <div className="stat-card">
          <div className="stat-card-icon" style={{ background: 'var(--blue-l)' }}>📊</div>
          <div className="stat-card-value">{ambulances.length}</div>
          <div className="stat-card-label">Total Fleet</div>
        </div>
      </div>

      <div className="grid-2" style={{ alignItems: 'start', marginBottom: 20 }}>

        {/* MAP */}
        <div className="card">
          <div className="card-header">
            <span>🗺️</span>
            <h2>Live Map — Jodhpur</h2>
            <span style={{ fontSize: 11, color: 'var(--text3)', marginLeft: 'auto' }}>
              🟢 Available &nbsp;🔴 On Duty &nbsp;🏥 Hospital
            </span>
          </div>
          <div
            ref={mapRef}
            style={{ height: 460, borderRadius: '0 0 14px 14px', zIndex: 0 }}
          />
        </div>

        {/* TABLE */}
        <div className="card">
          <div className="card-header"><span>🚑</span><h2>Fleet Status</h2></div>
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Unit</th>
                  <th>Driver</th>
                  <th>Status</th>
                  <th>Contact</th>
                </tr>
              </thead>
              <tbody>
                {ambulances.map(a => (
                  <tr
                    key={a.id}
                    style={{
                      cursor: 'pointer',
                      background: selectedAmb?.id === a.id ? 'var(--primary-l)' : '',
                    }}
                    onClick={() => {
                      setSelectedAmb(a)
                      if (mapInstance.current) {
                        mapInstance.current.setView([a.lat, a.lng], 15)
                      }
                    }}
                  >
                    <td><strong style={{ fontFamily: 'monospace' }}>{a.id}</strong></td>
                    <td>{a.driver}</td>
                    <td>
                      <span className={`badge ${a.status === 'Available' ? 'green' : 'red'}`}>
                        {a.status === 'Available' ? '● ' : '🚨 '}{a.status}
                      </span>
                    </td>
                    <td>
                      {a.status === 'Available'
                        ? <a href={`tel:${a.phone}`} className="btn btn-primary btn-sm">📞 Dispatch</a>
                        : <span style={{ fontSize: 12, color: 'var(--text3)' }}>{a.phone}</span>
                      }
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {selectedAmb && (
            <div style={{ padding: '14px 20px', borderTop: '1px solid var(--border)', background: 'var(--bg2)', borderRadius: '0 0 14px 14px' }}>
              <div style={{ fontWeight: 700, marginBottom: 4, fontSize: 13 }}>📍 {selectedAmb.id} selected</div>
              <div style={{ fontSize: 12, color: 'var(--text2)', lineHeight: 1.8 }}>
                Driver: {selectedAmb.driver}<br />
                Phone: {selectedAmb.phone}<br />
                GPS: {selectedAmb.lat?.toFixed(4)}, {selectedAmb.lng?.toFixed(4)}
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="alert alert-success">
        ✅ Map uses <strong>Leaflet.js + OpenStreetMap</strong> — completely free forever. No Google, no credit card, no API key.
      </div>
    </div>
  )
}
