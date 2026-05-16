// frontend/src/pages/Login.jsx
// Firebase Email/Password login for admin access

import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { loginWithEmail } from '../utils/firebase'

export default function Login() {
  const [email, setEmail]     = useState('')
  const [password, setPassword] = useState('')
  const [error, setError]     = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  const handleLogin = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await loginWithEmail(email, password)
      navigate('/dashboard')
    } catch (err) {
      setError(
        err.code === 'auth/invalid-credential'
          ? 'Invalid email or password.'
          : 'Login failed. Please try again.'
      )
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: 'var(--bg)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: 20,
    }}>
      <div style={{
        background: 'var(--surface)',
        borderRadius: 'var(--radius)',
        boxShadow: 'var(--shadow-lg)',
        padding: '40px 36px',
        width: '100%',
        maxWidth: 420,
        border: '1px solid var(--border)',
      }}>
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <div style={{
            width: 56, height: 56,
            background: 'var(--primary)',
            borderRadius: 16,
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 26,
            boxShadow: '0 6px 20px rgba(91,95,239,0.35)',
            marginBottom: 16,
          }}>🚑</div>
          <div style={{
            fontFamily: 'Outfit, sans-serif',
            fontSize: 22,
            fontWeight: 800,
            color: 'var(--text)',
            letterSpacing: '-0.5px',
          }}>
            Medi<span style={{ color: 'var(--primary)' }}>Route</span>
          </div>
          <div style={{ fontSize: 13, color: 'var(--text3)', marginTop: 4 }}>
            EHVRM — Admin Login
          </div>
        </div>

        {error && (
          <div className="alert alert-error" style={{ marginBottom: 20 }}>
            ⚠️ {error}
          </div>
        )}

        <form onSubmit={handleLogin}>
          <div className="form-group">
            <label className="form-label">Email Address</label>
            <input
              className="form-input"
              type="email"
              placeholder="admin@mediroute.in"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
              autoFocus
            />
          </div>

          <div className="form-group">
            <label className="form-label">Password</label>
            <input
              className="form-input"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
            />
          </div>

          <button
            type="submit"
            className="btn btn-primary"
            style={{ width: '100%', padding: '12px', fontSize: 14, marginTop: 8 }}
            disabled={loading}
          >
            {loading ? '⏳ Signing in...' : '🔐 Sign In'}
          </button>
        </form>

        <div style={{
          marginTop: 24,
          padding: '14px 16px',
          background: 'var(--blue-l)',
          borderRadius: 'var(--radius-sm)',
          fontSize: 12,
          color: 'var(--blue)',
          lineHeight: 1.6,
        }}>
          <strong>Hackathon / Demo mode:</strong> If you haven't set up Firebase Auth yet,
          the app works without login. Just navigate to <code>/dashboard</code> directly.
          To enable Auth, create a user in Firebase Console → Authentication → Users.
        </div>
      </div>
    </div>
  )
}
