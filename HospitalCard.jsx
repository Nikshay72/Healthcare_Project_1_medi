// frontend/src/components/HospitalCard.jsx
// Reusable clickable hospital summary card

import React from 'react'
import { useNavigate } from 'react-router-dom'

export default function HospitalCard({ hospital: h, onClick }) {
  const navigate = useNavigate()

  const handleClick = () => {
    if (onClick) onClick(h)
    else navigate(`/hospitals/${h.id}`)
  }

  return (
    <div className="hospital-card" onClick={handleClick}>
      <div
        className="htype"
        style={{
          background: h.type === 'Government' ? '#DCFCE7' : 'var(--blue-l)',
          color:      h.type === 'Government' ? '#16A34A'  : 'var(--blue)',
        }}
      >
        {h.type}
      </div>

      <div className="hname">{h.name}</div>
      <div className="haddr">📍 {h.address}</div>

      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 8 }}>
        <span className="hstat green">🛏️ {h.available_beds} beds</span>
        <span className="hstat amber">🫀 {h.icu_available} ICU</span>
        <span className={`hstat ${h.er_wait_min <= 10 ? 'green' : 'amber'}`}>
          ⏱️ {h.er_wait_min}m wait
        </span>
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 10 }}>
        <div>
          <span className="stars">{'★'.repeat(Math.round(h.rating))}</span>
          <span style={{ fontSize: 11, color: 'var(--text3)', marginLeft: 4 }}>{h.rating}</span>
        </div>
        <span className={`badge ${h.status === 'Available' ? 'green' : 'red'}`}>
          {h.status}
        </span>
      </div>

      <div style={{ marginTop: 8, display: 'flex', flexWrap: 'wrap', gap: 3 }}>
        {(h.services || []).slice(0, 4).map(s => (
          <span key={s} className="chip">{s}</span>
        ))}
        {(h.services || []).length > 4 && (
          <span className="chip">+{h.services.length - 4} more</span>
        )}
      </div>
    </div>
  )
}
