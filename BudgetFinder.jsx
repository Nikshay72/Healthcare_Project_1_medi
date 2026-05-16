import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { api } from '../utils/api'

const TIER_CONFIG = {
  Low:    { label: 'Low Budget / Government', color: '#22C55E', bg: '#F0FDF4', icon: '🟢' },
  Medium: { label: 'Medium Budget',           color: '#F59E0B', bg: '#FFFBEB', icon: '🟡' },
  High:   { label: 'Premium / Super-Speciality', color: '#EF4444', bg: '#FEF2F2', icon: '🔴' },
}

export default function BudgetFinder() {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [activeTier, setActiveTier] = useState('Low')
  const navigate = useNavigate()

  useEffect(() => {
    api.getBudgetHospitals().then(r => {
      setData(r.data)
      setLoading(false)
    })
  }, [])

  if (loading) return <div className="loading-wrap"><div className="spinner" />Loading...</div>

  const cfg = TIER_CONFIG[activeTier]
  const tierInfo = data.tiers[activeTier]
  const hospitals = data.hospitals[activeTier] || []

  return (
    <div>
      <div className="page-header">
        <h1>💰 Budget Finder</h1>
        <p>Find hospitals matching your financial situation</p>
      </div>

      {/* Tier Tabs */}
      <div style={{ display: 'flex', gap: 12, marginBottom: 24 }}>
        {['Low', 'Medium', 'High'].map(tier => {
          const c = TIER_CONFIG[tier]
          return (
            <button
              key={tier}
              onClick={() => setActiveTier(tier)}
              className="btn"
              style={{
                background: activeTier === tier ? c.color : 'var(--surface)',
                color: activeTier === tier ? '#fff' : 'var(--text2)',
                border: `2px solid ${c.color}`,
                padding: '10px 24px',
              }}
            >
              {c.icon} {c.label}
            </button>
          )
        })}
      </div>

      {/* Tier Info */}
      <div className="card" style={{ marginBottom: 20, borderLeft: `4px solid ${cfg.color}` }}>
        <div className="card-body">
          <p style={{ fontSize: 13, color: 'var(--text2)', marginBottom: 14 }}>{tierInfo.description}</p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12 }}>
            {[
              { label: 'Consultation', val: `₹${tierInfo.consultation}` },
              { label: 'Emergency Fee', val: `₹${tierInfo.emergency}` },
              { label: 'ICU / Day', val: `₹${tierInfo.icu_per_day}` },
              { label: 'Surgery Range', val: `₹${tierInfo.surgery}` },
            ].map(item => (
              <div key={item.label} style={{ background: cfg.bg, borderRadius: 10, padding: '12px 14px', textAlign: 'center' }}>
                <div style={{ fontSize: 14, fontWeight: 800, color: cfg.color }}>{item.val}</div>
                <div style={{ fontSize: 11, color: 'var(--text3)', marginTop: 4 }}>{item.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Hospitals in this tier */}
      <div style={{ marginBottom: 10, fontWeight: 700, fontSize: 15 }}>
        {hospitals.length} hospitals in this tier
      </div>
      <div className="hospitals-grid">
        {hospitals.map(h => (
          <div key={h.id} className="hospital-card" onClick={() => navigate(`/hospitals/${h.id}`)}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
              <span className={`badge ${h.type === 'Government' ? 'green' : 'blue'}`}>{h.type}</span>
              <span className="stars">{'★'.repeat(Math.round(h.rating))}</span>
            </div>
            <div className="hname">{h.name}</div>
            <div className="haddr">📍 {h.address}</div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6, marginTop: 10 }}>
              <div style={{ background: 'var(--bg2)', borderRadius: 8, padding: '8px 10px', fontSize: 12 }}>
                <div style={{ fontWeight: 700 }}>₹{h.consultation_fee}</div>
                <div style={{ color: 'var(--text3)' }}>Consultation</div>
              </div>
              <div style={{ background: 'var(--bg2)', borderRadius: 8, padding: '8px 10px', fontSize: 12 }}>
                <div style={{ fontWeight: 700 }}>₹{h.emergency_fee}</div>
                <div style={{ color: 'var(--text3)' }}>Emergency</div>
              </div>
            </div>
            <div style={{ marginTop: 8, display: 'flex', flexWrap: 'wrap', gap: 3 }}>
              {(h.services || []).slice(0, 5).map(s => (
                <span key={s} className="chip">{s}</span>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
