// frontend/src/pages/RoleSelect.jsx
// The first page — choose Hospital Staff or Patient/Public

import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'

const HOSPITALS = [
  { id: 1,  name: 'AIIMS Jodhpur',                      type: 'Government', icon: '🏛️' },
  { id: 2,  name: 'Umaid Hospital (SNMC)',               type: 'Government', icon: '🏥' },
  { id: 3,  name: 'Medipulse Hospital',                  type: 'Private',    icon: '🏥' },
  { id: 4,  name: 'Goyal Hospital & Research Centre',    type: 'Private',    icon: '🏥' },
  { id: 5,  name: 'Shri Ram Hospital (Pal Road)',        type: 'Private',    icon: '🏥' },
  { id: 6,  name: 'Pacific Medical College & Hospital',  type: 'Private',    icon: '🏥' },
  { id: 7,  name: 'Mahaveer Cancer Hospital',            type: 'Private',    icon: '🏥' },
  { id: 8,  name: 'Kamla Nagar Hospital',                type: 'Private',    icon: '🏥' },
  { id: 9,  name: 'Kailash Trauma & Research Centre',    type: 'Private',    icon: '🏥' },
  { id: 10, name: 'Bhandari Hospital',                   type: 'Private',    icon: '🏥' },
]

// Demo staff PIN per hospital (in production, use Firebase Auth)
const STAFF_PINS = {
  1: '1111', 2: '2222', 3: '3333', 4: '4444', 5: '5555',
  6: '6666', 7: '7777', 8: '8888', 9: '9999', 10: '1010',
}

export default function RoleSelect() {
  const [step, setStep]               = useState('role')      // 'role' | 'hospital' | 'pin'
  const [selectedHospital, setSelectedHospital] = useState(null)
  const [pin, setPin]                 = useState('')
  const [pinError, setPinError]       = useState('')
  const [loading, setLoading]         = useState(false)
  const navigate = useNavigate()

  const handlePublicLogin = () => {
    sessionStorage.setItem('userRole', 'public')
    sessionStorage.removeItem('hospitalId')
    navigate('/dashboard')
  }

  const handleHospitalSelect = (hospital) => {
    setSelectedHospital(hospital)
    setStep('pin')
    setPin('')
    setPinError('')
  }

  const handlePinSubmit = () => {
    if (!selectedHospital) return
    setLoading(true)
    setTimeout(() => {
      const correct = STAFF_PINS[selectedHospital.id]
      if (pin === correct || pin === '0000') { // 0000 = master demo PIN
        sessionStorage.setItem('userRole',    'hospital')
        sessionStorage.setItem('hospitalId',  String(selectedHospital.id))
        sessionStorage.setItem('hospitalName', selectedHospital.name)
        navigate('/hospital-command')
      } else {
        setPinError('Incorrect PIN. Try again.')
        setPin('')
      }
      setLoading(false)
    }, 600)
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #1E1B4B 0%, #0F172A 100%)',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: 20,
      fontFamily: 'Plus Jakarta Sans, sans-serif',
    }}>

      {/* Logo */}
      <div style={{ textAlign: 'center', marginBottom: 40 }}>
        <div style={{
          width: 70, height: 70,
          background: '#5B5FEF',
          borderRadius: 20,
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: 32,
          boxShadow: '0 8px 32px rgba(91,95,239,0.4)',
          marginBottom: 16,
        }}>🚑</div>
        <div style={{ fontFamily: 'Outfit, sans-serif', fontSize: 28, fontWeight: 800, color: '#fff', letterSpacing: -1 }}>
          Medi<span style={{ color: '#818CF8' }}>Route</span>
        </div>
        <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: 13, marginTop: 4 }}>
          Emergency Hospital Vehicle Routing & Management
        </div>
      </div>

      {/* ── STEP 1: Choose Role ── */}
      {step === 'role' && (
        <div style={{ width: '100%', maxWidth: 480 }}>
          <div style={{ color: 'rgba(255,255,255,0.6)', fontSize: 13, textAlign: 'center', marginBottom: 24 }}>
            Who are you?
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>

            {/* Hospital Staff */}
            <button
              onClick={() => setStep('hospital')}
              style={{
                background: 'rgba(255,255,255,0.05)',
                border: '1.5px solid rgba(255,255,255,0.15)',
                borderRadius: 16,
                padding: '28px 20px',
                cursor: 'pointer',
                transition: 'all 0.2s',
                color: '#fff',
                textAlign: 'center',
              }}
              onMouseEnter={e => { e.currentTarget.style.background = 'rgba(91,95,239,0.25)'; e.currentTarget.style.borderColor = '#818CF8' }}
              onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.05)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.15)' }}
            >
              <div style={{ fontSize: 40, marginBottom: 12 }}>🏥</div>
              <div style={{ fontWeight: 700, fontSize: 16, marginBottom: 6 }}>Hospital Staff</div>
              <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.5)', lineHeight: 1.5 }}>
                Doctors, nurses & ER coordinators managing incoming patients
              </div>
            </button>

            {/* Patient / Public */}
            <button
              onClick={handlePublicLogin}
              style={{
                background: 'rgba(255,255,255,0.05)',
                border: '1.5px solid rgba(255,255,255,0.15)',
                borderRadius: 16,
                padding: '28px 20px',
                cursor: 'pointer',
                transition: 'all 0.2s',
                color: '#fff',
                textAlign: 'center',
              }}
              onMouseEnter={e => { e.currentTarget.style.background = 'rgba(34,197,94,0.2)'; e.currentTarget.style.borderColor = '#22C55E' }}
              onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.05)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.15)' }}
            >
              <div style={{ fontSize: 40, marginBottom: 12 }}>👤</div>
              <div style={{ fontWeight: 700, fontSize: 16, marginBottom: 6 }}>Patient / Public</div>
              <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.5)', lineHeight: 1.5 }}>
                Find the best hospital, check bed availability & route emergencies
              </div>
            </button>
          </div>
        </div>
      )}

      {/* ── STEP 2: Choose Hospital ── */}
      {step === 'hospital' && (
        <div style={{ width: '100%', maxWidth: 520 }}>
          <button
            onClick={() => setStep('role')}
            style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.5)', cursor: 'pointer', marginBottom: 20, fontSize: 13 }}
          >
            ← Back
          </button>
          <div style={{ color: 'rgba(255,255,255,0.6)', fontSize: 13, marginBottom: 16, textAlign: 'center' }}>
            Select your hospital
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8, maxHeight: 420, overflowY: 'auto' }}>
            {HOSPITALS.map(h => (
              <button
                key={h.id}
                onClick={() => handleHospitalSelect(h)}
                style={{
                  background: 'rgba(255,255,255,0.05)',
                  border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: 12,
                  padding: '14px 18px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 14,
                  color: '#fff',
                  textAlign: 'left',
                  transition: 'all 0.15s',
                }}
                onMouseEnter={e => { e.currentTarget.style.background = 'rgba(91,95,239,0.2)'; e.currentTarget.style.borderColor = '#818CF8' }}
                onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.05)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)' }}
              >
                <div style={{
                  width: 42, height: 42, borderRadius: 10,
                  background: h.type === 'Government' ? 'rgba(34,197,94,0.2)' : 'rgba(59,130,246,0.2)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 20, flexShrink: 0,
                }}>{h.icon}</div>
                <div>
                  <div style={{ fontWeight: 600, fontSize: 14 }}>{h.name}</div>
                  <div style={{ fontSize: 11, color: h.type === 'Government' ? '#86EFAC' : '#93C5FD', marginTop: 2 }}>
                    {h.type} Hospital
                  </div>
                </div>
                <div style={{ marginLeft: 'auto', color: 'rgba(255,255,255,0.3)', fontSize: 18 }}>›</div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* ── STEP 3: PIN Entry ── */}
      {step === 'pin' && selectedHospital && (
        <div style={{ width: '100%', maxWidth: 380 }}>
          <button
            onClick={() => setStep('hospital')}
            style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.5)', cursor: 'pointer', marginBottom: 20, fontSize: 13 }}
          >
            ← Back
          </button>

          <div style={{
            background: 'rgba(255,255,255,0.05)',
            border: '1px solid rgba(255,255,255,0.1)',
            borderRadius: 16,
            padding: '28px 24px',
          }}>
            <div style={{ textAlign: 'center', marginBottom: 24 }}>
              <div style={{ fontSize: 32, marginBottom: 8 }}>🔐</div>
              <div style={{ color: '#fff', fontWeight: 700, fontSize: 16, marginBottom: 4 }}>
                {selectedHospital.name}
              </div>
              <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: 12 }}>
                Enter staff PIN to access HospitalCommand
              </div>
            </div>

            {pinError && (
              <div style={{
                background: 'rgba(239,68,68,0.2)', border: '1px solid rgba(239,68,68,0.3)',
                borderRadius: 8, padding: '8px 12px', marginBottom: 16,
                color: '#FCA5A5', fontSize: 12, textAlign: 'center',
              }}>
                ⚠️ {pinError}
              </div>
            )}

            {/* PIN dots display */}
            <div style={{ display: 'flex', justifyContent: 'center', gap: 12, marginBottom: 20 }}>
              {[0,1,2,3].map(i => (
                <div key={i} style={{
                  width: 16, height: 16, borderRadius: '50%',
                  background: pin.length > i ? '#818CF8' : 'rgba(255,255,255,0.15)',
                  transition: 'all 0.2s',
                  transform: pin.length > i ? 'scale(1.2)' : 'scale(1)',
                }} />
              ))}
            </div>

            {/* PIN pad */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10 }}>
              {[1,2,3,4,5,6,7,8,9,'',0,'⌫'].map((k, i) => (
                <button
                  key={i}
                  disabled={k === ''}
                  onClick={() => {
                    if (k === '⌫') setPin(p => p.slice(0,-1))
                    else if (pin.length < 4) {
                      const newPin = pin + k
                      setPin(newPin)
                      if (newPin.length === 4) {
                        // Auto-submit when 4 digits entered
                        setTimeout(() => {
                          const correct = STAFF_PINS[selectedHospital.id]
                          if (newPin === correct || newPin === '0000') {
                            sessionStorage.setItem('userRole', 'hospital')
                            sessionStorage.setItem('hospitalId', String(selectedHospital.id))
                            sessionStorage.setItem('hospitalName', selectedHospital.name)
                            navigate('/hospital-command')
                          } else {
                            setPinError('Incorrect PIN. Try again.')
                            setPin('')
                          }
                        }, 200)
                      }
                    }
                  }}
                  style={{
                    background: k === '' ? 'transparent' : 'rgba(255,255,255,0.07)',
                    border: k === '' ? 'none' : '1px solid rgba(255,255,255,0.12)',
                    borderRadius: 10,
                    height: 52,
                    color: '#fff',
                    fontSize: k === '⌫' ? 18 : 20,
                    fontWeight: 600,
                    cursor: k === '' ? 'default' : 'pointer',
                    transition: 'all 0.15s',
                    fontFamily: 'Plus Jakarta Sans, sans-serif',
                  }}
                  onMouseEnter={e => { if (k !== '') e.currentTarget.style.background = 'rgba(91,95,239,0.3)' }}
                  onMouseLeave={e => { if (k !== '') e.currentTarget.style.background = 'rgba(255,255,255,0.07)' }}
                >
                  {k}
                </button>
              ))}
            </div>

            <div style={{ textAlign: 'center', marginTop: 16, color: 'rgba(255,255,255,0.3)', fontSize: 11 }}>
              Demo PIN: hospital ID digits (e.g. AIIMS = 1111) · Master: 0000
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
