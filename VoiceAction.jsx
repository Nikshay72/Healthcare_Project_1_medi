// frontend/src/pages/VoiceAction.jsx
// ─────────────────────────────────────────────────────────────────────────────
//  This page handles deep links from Siri Shortcuts & Google Assistant.
//  URL format: /voice?cmd=cardiac+arrest&severity=Critical
//
//  How it works:
//    Siri/Google opens: http://localhost:5173/voice?cmd=cardiac+arrest
//    This page reads the URL params, executes the command, then redirects.
// ─────────────────────────────────────────────────────────────────────────────

import React, { useEffect, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'

const CONDITION_MAP = {
  'cardiac':    'Cardiac Arrest',
  'cardiac arrest': 'Cardiac Arrest',
  'heart':      'Cardiac Arrest',
  'heart attack': 'Cardiac Arrest',
  'trauma':     'Trauma / Accident',
  'accident':   'Trauma / Accident',
  'burns':      'Burns',
  'burn':       'Burns',
  'neuro':      'Neurological',
  'neurological': 'Neurological',
  'stroke':     'Neurological',
  'brain':      'Neurological',
  'kidney':     'Kidney Failure',
  'dialysis':   'Kidney Failure',
  'general':    'General Emergency',
  'emergency':  'General Emergency',
}

const PAGE_MAP = {
  'dashboard':  '/dashboard',
  'hospitals':  '/hospitals',
  'hospital':   '/hospitals',
  'ambulance':  '/ambulances',
  'ambulances': '/ambulances',
  'map':        '/ambulances',
  'budget':     '/budget',
  'log':        '/emergency-log',
  'route':      '/emergency-router',
  'emergency':  '/emergency-router',
}

export default function VoiceAction() {
  const [searchParams] = useSearchParams()
  const navigate       = useNavigate()
  const [status, setStatus] = useState('Processing command...')

  useEffect(() => {
    const cmd      = (searchParams.get('cmd')      || '').toLowerCase().trim()
    const severity = (searchParams.get('severity') || 'High').trim()
    const page     = (searchParams.get('page')     || '').toLowerCase().trim()

    // Store in sessionStorage so EmergencyRouter can read it
    if (cmd) {
      const condition = CONDITION_MAP[cmd]
      if (condition) {
        sessionStorage.setItem('voice_condition', condition)
        sessionStorage.setItem('voice_severity',  severity)
        setStatus(`Routing for: ${condition} (${severity})`)
        setTimeout(() => navigate('/emergency-router'), 1200)
        return
      }
    }

    if (page) {
      const target = PAGE_MAP[page]
      if (target) {
        setStatus(`Opening ${page}...`)
        setTimeout(() => navigate(target), 800)
        return
      }
    }

    setStatus('Command not recognised. Going to dashboard...')
    setTimeout(() => navigate('/dashboard'), 1500)
  }, [])

  return (
    <div style={{
      minHeight: '100vh',
      background: 'var(--sidebar-bg)',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 20,
      color: '#fff',
      fontFamily: 'Plus Jakarta Sans, sans-serif',
    }}>
      <div style={{
        width: 70, height: 70,
        background: 'var(--primary)',
        borderRadius: 20,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: 32,
        boxShadow: '0 8px 24px rgba(91,95,239,0.4)',
        animation: 'pulse 1.5s ease-in-out infinite',
      }}>🎤</div>

      <div style={{ fontSize: 20, fontWeight: 700 }}>MediRoute Voice</div>
      <div style={{ fontSize: 14, color: 'rgba(255,255,255,0.6)' }}>{status}</div>

      <div style={{
        width: 200, height: 3,
        background: 'rgba(255,255,255,0.1)',
        borderRadius: 3,
        overflow: 'hidden',
        marginTop: 10,
      }}>
        <div style={{
          height: '100%',
          background: 'var(--primary)',
          borderRadius: 3,
          animation: 'progress 1.5s ease-in-out forwards',
        }} />
      </div>

      <style>{`
        @keyframes pulse {
          0%,100% { transform: scale(1); }
          50% { transform: scale(1.08); }
        }
        @keyframes progress {
          from { width: 0%; }
          to   { width: 100%; }
        }
      `}</style>
    </div>
  )
}
