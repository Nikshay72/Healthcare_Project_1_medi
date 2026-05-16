import React, { useEffect, useState } from 'react'
import { useLocation } from 'react-router-dom'

const PAGE_TITLES = {
  '/dashboard': '📊 Dashboard',
  '/hospitals': '🏥 Hospital Directory',
  '/emergency-router': '🚑 Emergency Router',
  '/ambulances': '🗺️ Ambulance Tracker',
  '/budget': '💰 Budget Finder',
  '/emergency-log': '📋 Emergency Log',
  '/voice-setup': '🎤 Voice Assistant Setup',
  '/voice': '🎤 Voice Command',
}

export default function Topbar() {
  const location = useLocation()
  const [time, setTime] = useState(new Date().toLocaleTimeString())

  useEffect(() => {
    const t = setInterval(() => setTime(new Date().toLocaleTimeString()), 1000)
    return () => clearInterval(t)
  }, [])

  const title = PAGE_TITLES[location.pathname] || 'MediRoute'

  return (
    <div className="topbar">
      <div className="topbar-title">{title}</div>
      <div className="topbar-badge">
        <div className="dot" />
        System Live
      </div>
      <div style={{ fontSize: 12, color: 'var(--text3)', fontWeight: 600 }}>{time}</div>
    </div>
  )
}
