// frontend/src/pages/VoiceSetup.jsx
// Step-by-step guide for connecting Siri Shortcuts and Google Assistant

import React, { useState } from 'react'

const BASE_URL = window.location.origin  // e.g. http://localhost:5173

const SIRI_SHORTCUTS = [
  { name: 'MediRoute - Cardiac Emergency', url: `${BASE_URL}/voice?cmd=cardiac+arrest&severity=Critical`, icon: '❤️' },
  { name: 'MediRoute - Trauma Emergency',  url: `${BASE_URL}/voice?cmd=trauma&severity=High`,           icon: '🚨' },
  { name: 'MediRoute - Burns Emergency',   url: `${BASE_URL}/voice?cmd=burns&severity=High`,            icon: '🔥' },
  { name: 'MediRoute - Open Dashboard',    url: `${BASE_URL}/voice?page=dashboard`,                      icon: '📊' },
  { name: 'MediRoute - Ambulance Map',     url: `${BASE_URL}/voice?page=ambulances`,                     icon: '🗺️' },
  { name: 'MediRoute - Budget Hospitals',  url: `${BASE_URL}/voice?page=budget`,                         icon: '💰' },
]

export default function VoiceSetup() {
  const [copied, setCopied] = useState(null)

  const copy = (text, key) => {
    navigator.clipboard.writeText(text)
    setCopied(key)
    setTimeout(() => setCopied(null), 2000)
  }

  return (
    <div>
      <div className="page-header">
        <h1>🎤 Voice Assistant Setup</h1>
        <p>Connect MediRoute to Siri, Google Assistant, and browser voice commands</p>
      </div>

      {/* Browser voice — already works */}
      <div className="card" style={{ marginBottom: 20, borderLeft: '4px solid var(--green)' }}>
        <div className="card-header"><span>🌐</span><h2>Browser Voice Commands</h2><span className="badge green">✓ Already Working</span></div>
        <div className="card-body">
          <p style={{ fontSize: 13, color: 'var(--text2)', marginBottom: 16 }}>
            Click the <strong>🎤 mic button</strong> at the bottom-right of any page. Works in Chrome and Edge.
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 10 }}>
            {[
              ['🧭 Navigation', ['"go to dashboard"', '"open hospitals"', '"ambulance tracker"', '"budget finder"', '"emergency log"']],
              ['🚨 Emergency Type', ['"cardiac arrest"', '"trauma"', '"burns"', '"neurological"', '"kidney failure"']],
              ['⚡ Actions', ['"find hospital now"', '"use my location"', '"critical"', '"help"', '"stop listening"']],
            ].map(([title, cmds]) => (
              <div key={title} style={{ background: 'var(--bg2)', borderRadius: 10, padding: 14 }}>
                <div style={{ fontWeight: 700, fontSize: 12, marginBottom: 8, color: 'var(--text3)', textTransform: 'uppercase' }}>{title}</div>
                {cmds.map(c => (
                  <div key={c} style={{ fontSize: 12, background: 'var(--primary-l)', color: 'var(--primary)', padding: '3px 8px', borderRadius: 10, marginBottom: 4, fontWeight: 500 }}>
                    {c}
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Siri Shortcuts */}
      <div className="card" style={{ marginBottom: 20 }}>
        <div className="card-header"><span>🍎</span><h2>Siri Shortcuts (iPhone / iPad)</h2></div>
        <div className="card-body">
          <div className="alert alert-info" style={{ marginBottom: 16 }}>
            📱 These steps are done on your iPhone. Each shortcut opens MediRoute directly when you say <em>"Hey Siri, [name]"</em>
          </div>

          <div style={{ marginBottom: 20 }}>
            <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 12 }}>Step-by-step:</div>
            {[
              'On your iPhone → open the Shortcuts app (pre-installed)',
              'Tap the + button (top right) to create a new shortcut',
              'Tap "Add Action" → search for "Open URLs" → select it',
              'Paste one of the URLs below into the URL field',
              'Tap the shortcut name at the top → give it a name (e.g. "Cardiac Emergency")',
              'Tap the ⋯ icon → "Add to Siri" → record your trigger phrase',
              'Now say "Hey Siri, Cardiac Emergency" — it opens MediRoute instantly!',
            ].map((step, i) => (
              <div key={i} style={{ display: 'flex', gap: 12, marginBottom: 10, fontSize: 13 }}>
                <div style={{
                  width: 24, height: 24, borderRadius: '50%',
                  background: 'var(--primary)', color: '#fff',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 11, fontWeight: 700, flexShrink: 0,
                }}>{i + 1}</div>
                <div style={{ paddingTop: 2, color: 'var(--text2)' }}>{step}</div>
              </div>
            ))}
          </div>

          <div style={{ fontWeight: 700, fontSize: 13, marginBottom: 10 }}>Shortcut URLs to use:</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {SIRI_SHORTCUTS.map((s) => (
              <div key={s.name} style={{
                display: 'flex', alignItems: 'center', gap: 12,
                background: 'var(--bg2)', borderRadius: 10, padding: '10px 14px',
              }}>
                <span style={{ fontSize: 20 }}>{s.icon}</span>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 600, fontSize: 13 }}>{s.name}</div>
                  <div style={{ fontSize: 11, color: 'var(--text3)', fontFamily: 'monospace', marginTop: 2 }}>{s.url}</div>
                </div>
                <button
                  className="btn btn-outline btn-sm"
                  onClick={() => copy(s.url, s.name)}
                >
                  {copied === s.name ? '✓ Copied!' : '📋 Copy'}
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Google Assistant */}
      <div className="card" style={{ marginBottom: 20 }}>
        <div className="card-header"><span>🤖</span><h2>Google Assistant (Android)</h2></div>
        <div className="card-body">
          <div className="alert alert-info" style={{ marginBottom: 16 }}>
            📱 Google Assistant uses <strong>Routines</strong> to open URLs when you say a phrase.
          </div>

          <div style={{ marginBottom: 20 }}>
            <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 12 }}>Step-by-step:</div>
            {[
              'Open Google Assistant app on your Android phone',
              'Tap your profile icon (top right) → "Assistant" tab → "Routines"',
              'Tap the + button → "Add a starter" → "Voice" → type your phrase (e.g. "cardiac emergency")',
              'Tap "Add an action" → "Browse popular actions" → scroll down → "Open website"',
              'Paste the URL from the table below',
              'Tap Save — now say "Hey Google, cardiac emergency" to open MediRoute!',
            ].map((step, i) => (
              <div key={i} style={{ display: 'flex', gap: 12, marginBottom: 10, fontSize: 13 }}>
                <div style={{
                  width: 24, height: 24, borderRadius: '50%',
                  background: '#4285F4', color: '#fff',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 11, fontWeight: 700, flexShrink: 0,
                }}>{i + 1}</div>
                <div style={{ paddingTop: 2, color: 'var(--text2)' }}>{step}</div>
              </div>
            ))}
          </div>

          <div style={{ fontWeight: 700, fontSize: 13, marginBottom: 10 }}>URLs for Google Assistant Routines:</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {SIRI_SHORTCUTS.map((s) => (
              <div key={s.name} style={{
                display: 'flex', alignItems: 'center', gap: 12,
                background: 'var(--bg2)', borderRadius: 10, padding: '10px 14px',
              }}>
                <span style={{ fontSize: 20 }}>{s.icon}</span>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 600, fontSize: 13 }}>{s.name}</div>
                  <div style={{ fontSize: 11, color: 'var(--text3)', fontFamily: 'monospace', marginTop: 2 }}>{s.url}</div>
                </div>
                <button
                  className="btn btn-outline btn-sm"
                  onClick={() => copy(s.url, `ga-${s.name}`)}
                >
                  {copied === `ga-${s.name}` ? '✓ Copied!' : '📋 Copy'}
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Important note for production */}
      <div className="card" style={{ borderLeft: '4px solid var(--amber)' }}>
        <div className="card-header"><span>⚠️</span><h2>For Hackathon Demo</h2></div>
        <div className="card-body">
          <p style={{ fontSize: 13, color: 'var(--text2)', lineHeight: 1.7 }}>
            Currently the app runs on <code>localhost:5173</code> which only works on your own computer.
            For Siri and Google Assistant to work on your phone, you need to either:
          </p>
          <div style={{ marginTop: 12, display: 'flex', flexDirection: 'column', gap: 8 }}>
            {[
              { opt: 'Option 1 (Easiest for demo)', text: 'Use ngrok to expose localhost: run "npx ngrok http 5173" → copy the https URL → replace localhost:5173 in the shortcut URLs above' },
              { opt: 'Option 2 (Same WiFi)', text: 'Find your computer\'s IP address (e.g. 192.168.1.5) → use http://192.168.1.5:5173 in the shortcuts → your phone must be on the same WiFi' },
              { opt: 'Option 3 (Deploy)', text: 'Deploy to Vercel (free): run "npm i -g vercel && vercel" in the frontend folder → get a public URL like mediroute.vercel.app' },
            ].map(({ opt, text }) => (
              <div key={opt} style={{ background: 'var(--amber-l)', borderRadius: 10, padding: '12px 14px', fontSize: 13 }}>
                <div style={{ fontWeight: 700, color: 'var(--amber)', marginBottom: 4 }}>{opt}</div>
                <div style={{ color: 'var(--text2)' }}>{text}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
