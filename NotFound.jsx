// frontend/src/pages/NotFound.jsx

import React from 'react'
import { useNavigate } from 'react-router-dom'

export default function NotFound() {
  const navigate = useNavigate()
  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      flexDirection: 'column',
      gap: 16,
      background: 'var(--bg)',
    }}>
      <div style={{ fontSize: 72 }}>🏥</div>
      <h1 style={{ fontSize: 28, fontWeight: 800, color: 'var(--text)' }}>404 — Page Not Found</h1>
      <p style={{ color: 'var(--text3)', fontSize: 14 }}>
        The page you're looking for doesn't exist in the EHVRM system.
      </p>
      <button className="btn btn-primary" onClick={() => navigate('/dashboard')}>
        ← Back to Dashboard
      </button>
    </div>
  )
}
