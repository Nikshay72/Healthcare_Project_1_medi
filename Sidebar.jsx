import React from 'react'
import { useNavigate, useLocation } from 'react-router-dom'

const NAV_ITEMS = [
  { group: 'OVERVIEW', items: [
    { id: 'dashboard', icon: '📊', label: 'Dashboard', path: '/dashboard' },
  ]},
  { group: 'EMERGENCY', items: [
    { id: 'emergency-router', icon: '🚑', label: 'Emergency Router', path: '/emergency-router' },
    { id: 'ambulances', icon: '🗺️', label: 'Ambulance Tracker', path: '/ambulances' },
    { id: 'emergency-log', icon: '📋', label: 'Emergency Log', path: '/emergency-log' },
  ]},
  { group: 'VOICE', items: [
    { id: 'voice-setup', icon: '🎤', label: 'Voice Setup', path: '/voice-setup' },
  ]},
  { group: 'HOSPITALS', items: [
    { id: 'hospitals', icon: '🏥', label: 'Hospital Directory', path: '/hospitals' },
    { id: 'budget', icon: '💰', label: 'Budget Finder', path: '/budget' },
  ]},
]

export default function Sidebar({ activePage, setActivePage }) {
  const navigate = useNavigate()
  const location = useLocation()

  const handleNav = (item) => {
    setActivePage(item.id)
    navigate(item.path)
  }

  return (
    <aside className="sidebar">
      <div className="sidebar-logo" onClick={() => handleNav({ id: 'dashboard', path: '/dashboard' })}>
        <div className="sidebar-logo-icon">🚑</div>
        <div className="sidebar-logo-text">Medi<span>Route</span></div>
      </div>

      {NAV_ITEMS.map(group => (
        <div key={group.group}>
          <div className="nav-group-label">{group.group}</div>
          {group.items.map(item => (
            <button
              key={item.id}
              className={`nav-btn ${location.pathname === item.path ? 'active' : ''}`}
              onClick={() => handleNav(item)}
            >
              <span className="nav-icon">{item.icon}</span>
              <span className="label">{item.label}</span>
            </button>
          ))}
        </div>
      ))}

      <div className="sidebar-bottom">
        <div style={{ padding: '8px 20px', fontSize: 11, color: 'rgba(255,255,255,0.3)' }}>
          🔴 LIVE &nbsp; EHVRM v1.0<br />
          <span style={{ fontSize: 10 }}>Jodhpur Emergency Network</span>
        </div>
      </div>
    </aside>
  )
}
