// frontend/src/components/StatCard.jsx
// Reusable stat card used on Dashboard and other overview pages

import React from 'react'

/**
 * Props:
 *   icon      — emoji or React node
 *   label     — string
 *   value     — number or string
 *   iconBg    — CSS color for icon background  (default: var(--primary-l))
 *   valueColor — CSS color for the big number  (default: var(--text))
 *   subtitle  — optional small text below value
 */
export default function StatCard({ icon, label, value, iconBg, valueColor, subtitle }) {
  return (
    <div className="stat-card">
      <div
        className="stat-card-icon"
        style={{ background: iconBg || 'var(--primary-l)' }}
      >
        <span style={{ fontSize: 18 }}>{icon}</span>
      </div>
      <div
        className="stat-card-value"
        style={{ color: valueColor || 'var(--text)' }}
      >
        {value ?? '—'}
      </div>
      <div className="stat-card-label">{label}</div>
      {subtitle && (
        <div style={{ fontSize: 11, color: 'var(--text4)', marginTop: 2 }}>
          {subtitle}
        </div>
      )}
    </div>
  )
}
