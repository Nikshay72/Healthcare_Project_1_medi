// frontend/src/components/ErrorBanner.jsx
// Shown when an API call fails — guides user to start the backend

import React from 'react'

export default function ErrorBanner({ message }) {
  return (
    <div className="alert alert-error" style={{ marginBottom: 20 }}>
      <strong>⚠️ Connection error</strong><br />
      {message || 'Could not reach the backend.'}&nbsp;
      Make sure Flask is running:&nbsp;
      <code style={{ background: '#fee2e2', padding: '1px 6px', borderRadius: 4 }}>
        cd backend &amp;&amp; python app.py
      </code>
    </div>
  )
}
