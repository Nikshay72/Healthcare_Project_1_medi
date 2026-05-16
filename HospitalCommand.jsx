// frontend/src/pages/HospitalCommand.jsx
// Full hospital staff command centre — converted from hospital_command_v2.html
// Real-time Firebase sync: any update here instantly reflects on the patient side

import React, { useState, useEffect, useRef, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { db, FIREBASE_ENABLED } from '../utils/firebase'

// ── Firebase imports (dynamic to avoid crash if not configured) ──────────────
let firestoreSet, firestoreDoc, firestoreOnSnapshot, firestoreCollection
if (FIREBASE_ENABLED) {
  import('firebase/firestore').then(m => {
    firestoreSet        = m.setDoc
    firestoreDoc        = m.doc
    firestoreOnSnapshot = m.onSnapshot
    firestoreCollection = m.collection
  })
}

// ── Initial hospital data (also used as fallback if Firebase not set up) ─────
const INITIAL_BED_DATA = {
  1:  { available_beds: 58, icu_available: 12, er_wait_min: 18, trauma_available: 9,  burn_available: 5,  status: 'Available' },
  2:  { available_beds: 145, icu_available: 24, er_wait_min: 25, trauma_available: 16, burn_available: 8,  status: 'Available' },
  3:  { available_beds: 32, icu_available: 9,  er_wait_min: 7,  trauma_available: 5,  burn_available: 2,  status: 'Available' },
  4:  { available_beds: 28, icu_available: 7,  er_wait_min: 8,  trauma_available: 4,  burn_available: 2,  status: 'Available' },
  5:  { available_beds: 22, icu_available: 6,  er_wait_min: 9,  trauma_available: 4,  burn_available: 2,  status: 'Available' },
  6:  { available_beds: 80, icu_available: 18, er_wait_min: 12, trauma_available: 10, burn_available: 5,  status: 'Available' },
  7:  { available_beds: 22, icu_available: 6,  er_wait_min: 14, trauma_available: 1,  burn_available: 0,  status: 'Available' },
  8:  { available_beds: 16, icu_available: 4,  er_wait_min: 11, trauma_available: 3,  burn_available: 1,  status: 'Available' },
  9:  { available_beds: 13, icu_available: 4,  er_wait_min: 8,  trauma_available: 4,  burn_available: 2,  status: 'Available' },
  10: { available_beds: 18, icu_available: 4,  er_wait_min: 9,  trauma_available: 3,  burn_available: 1,  status: 'Available' },
}

const INITIAL_BAYS = [
  { id:'ER-1',  name:'Resus 1',       type:'resus',   status:'occupied',  patient:'Hari Chand Saini', diag:'Cardiac Arrest',     since:'14:22', dept:'Resus' },
  { id:'ER-2',  name:'Resus 2',       type:'resus',   status:'reserved',  patient:'Tarun Khatri (ETA 5 min)', diag:'Severe TBI', since:'Pending', dept:'Neurosurgery' },
  { id:'ER-3',  name:'Trauma 1',      type:'trauma',  status:'free',      patient:'—',                diag:'',               since:'',      dept:'' },
  { id:'ER-4',  name:'Trauma 2',      type:'trauma',  status:'pending',   patient:'Rahul Sharma',     diag:'Polytrauma',        since:'Pending', dept:'Trauma' },
  { id:'ER-5',  name:'Bay 1',         type:'general', status:'occupied',  patient:'Dev Prakash',      diag:'Stroke — Imaging',  since:'14:18', dept:'Neurology' },
  { id:'ER-6',  name:'Bay 2',         type:'general', status:'occupied',  patient:'Priya Kumari',     diag:'Acute MI — Cath Lab',since:'14:30',dept:'Cardiology' },
  { id:'ER-7',  name:'Bay 3',         type:'general', status:'free',      patient:'—',                diag:'',               since:'',      dept:'' },
  { id:'ER-8',  name:'Bay 4',         type:'general', status:'cleaning',  patient:'—',                diag:'Post-discharge', since:'~10 min',dept:'' },
  { id:'ER-9',  name:'Bay 5',         type:'general', status:'reserved',  patient:'Karan Bishnoi',    diag:'Penetrating Trauma',since:'Pending',dept:'Trauma' },
  { id:'ER-10', name:'Paeds 1',       type:'paeds',   status:'pending',   patient:'Arjun Meena',      diag:'Febrile Seizure',  since:'Pending', dept:'Paediatrics' },
  { id:'ER-11', name:'Paeds 2',       type:'paeds',   status:'free',      patient:'—',                diag:'',               since:'',      dept:'' },
  { id:'ER-12', name:'OB Bay 1',      type:'ob',      status:'occupied',  patient:'Fatima Sheikh',    diag:'Pre-eclampsia',    since:'14:28', dept:'Obstetrics' },
  { id:'ER-13', name:'OB Bay 2',      type:'ob',      status:'reserved',  patient:'Sangeeta Totla',   diag:'Eclampsia',        since:'Pending', dept:'Obstetrics' },
  { id:'ER-14', name:'Burns Unit',    type:'burns',   status:'reserved',  patient:'Monika Rawat',     diag:'Burns 40% BSA',    since:'Pending', dept:'Burns' },
  { id:'ER-15', name:'ICU Step-down', type:'icu',     status:'free',      patient:'—',                diag:'',               since:'',      dept:'' },
]

const statusColors = {
  occupied: { bg: '#FEF2F2', border: '#FECDCA', dot: '#EF4444', label: 'Occupied' },
  free:     { bg: '#F0FDF4', border: '#9FE2C0', dot: '#22C55E', label: 'Free' },
  reserved: { bg: '#EFF6FF', border: '#BFCFEE', dot: '#3B82F6', label: 'Reserved' },
  pending:  { bg: '#FFFBEB', border: '#FCD68A', dot: '#F59E0B', label: 'Pending' },
  cleaning: { bg: '#FFFBEB', border: '#FCD68A', dot: '#F59E0B', label: 'Cleaning' },
}

export default function HospitalCommand() {
  const navigate    = useNavigate()
  const hospitalId  = parseInt(sessionStorage.getItem('hospitalId') || '1')
  const hospitalName = sessionStorage.getItem('hospitalName') || 'Hospital'

  const [beds, setBeds]   = useState(INITIAL_BED_DATA[hospitalId] || INITIAL_BED_DATA[1])
  const [bays, setBays]   = useState(INITIAL_BAYS)
  const [activeTab, setActiveTab] = useState('beds')
  const [saving, setSaving]       = useState(false)
  const [savedMsg, setSavedMsg]   = useState('')
  const [feed, setFeed]           = useState([
    { msg: `HospitalCommand — ${hospitalName} staff logged in`, type: 'info', time: new Date().toLocaleTimeString() },
  ])
  const [editBay, setEditBay]     = useState(null)
  const [time, setTime]           = useState(new Date().toLocaleTimeString())

  // Clock
  useEffect(() => {
    const t = setInterval(() => setTime(new Date().toLocaleTimeString()), 1000)
    return () => clearInterval(t)
  }, [])

  // ── Load from Firebase on mount ──────────────────────────────────────────
  useEffect(() => {
    if (!FIREBASE_ENABLED || !db) return
    import('firebase/firestore').then(({ doc, onSnapshot }) => {
      const unsub = onSnapshot(
        doc(db, 'hospitals', String(hospitalId)),
        (snap) => {
          if (snap.exists()) {
            const data = snap.data()
            setBeds(prev => ({ ...prev, ...data }))
          }
        }
      )
      return unsub
    })
  }, [hospitalId])

  // ── Push bed update to Firebase (patient side will update in real-time) ──
  const pushToFirebase = async (newBeds) => {
    if (!FIREBASE_ENABLED || !db) return
    try {
      const { doc, setDoc, serverTimestamp } = await import('firebase/firestore')
      await setDoc(doc(db, 'hospitals', String(hospitalId)), {
        ...newBeds,
        last_updated: serverTimestamp(),
        hospital_id: hospitalId,
        hospital_name: hospitalName,
      }, { merge: true })
    } catch (e) {
      console.warn('[Firebase] push failed:', e.message)
    }
  }

  const addFeed = (msg, type = 'info') => {
    setFeed(prev => [{
      msg, type,
      time: new Date().toLocaleTimeString()
    }, ...prev].slice(0, 30))
  }

  const handleBedChange = (field, value) => {
    const parsed = parseInt(value)
    if (isNaN(parsed) || parsed < 0) return
    setBeds(prev => ({ ...prev, [field]: parsed }))
  }

  const handleSave = async () => {
    setSaving(true)
    await pushToFirebase(beds)
    setTimeout(() => {
      setSaving(false)
      setSavedMsg('✅ Live — patient side updated!')
      addFeed(`Bed stats updated: ${beds.available_beds} beds, ${beds.icu_available} ICU, ${beds.er_wait_min}min wait`, 'ok')
      setTimeout(() => setSavedMsg(''), 3000)
    }, 600)
  }

  const handleBayStatusChange = (bayIdx, newStatus) => {
    const updated = [...bays]
    updated[bayIdx] = { ...updated[bayIdx], status: newStatus }
    setBays(updated)

    const freeBays  = updated.filter(b => b.status === 'free').length
    const availBeds = beds.available_beds + (newStatus === 'free' ? 1 : -1)
    const newBeds   = { ...beds, available_beds: Math.max(0, availBeds) }
    setBeds(newBeds)
    pushToFirebase(newBeds)
    addFeed(`Bay ${updated[bayIdx].name} → ${newStatus}`, 'info')
  }

  const handleERWaitChange = (val) => {
    const newBeds = { ...beds, er_wait_min: parseInt(val) || 0 }
    setBeds(newBeds)
    pushToFirebase(newBeds)
    addFeed(`ER wait time updated to ${val} min`, 'info')
  }

  const handleStatusChange = (newStatus) => {
    const newBeds = { ...beds, status: newStatus }
    setBeds(newBeds)
    pushToFirebase(newBeds)
    addFeed(`Hospital status changed to: ${newStatus}`, newStatus === 'Full' ? 'alert' : 'ok')
  }

  const freeBays  = bays.filter(b => b.status === 'free').length
  const occupiedBays = bays.filter(b => b.status === 'occupied').length

  return (
    <div style={{
      minHeight: '100vh',
      background: '#EEF2F8',
      fontFamily: 'Plus Jakarta Sans, sans-serif',
      fontSize: 13,
    }}>

      {/* ── TOPBAR ── */}
      <div style={{
        height: 52, background: '#0B1523',
        display: 'flex', alignItems: 'center',
        padding: '0 20px', gap: 12, position: 'sticky', top: 0, zIndex: 100,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{
            width: 28, height: 28, background: '#E53929', borderRadius: 7,
            display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14,
          }}>🏥</div>
          <div>
            <div style={{ color: '#fff', fontWeight: 700, fontSize: 14, fontFamily: 'Outfit, sans-serif' }}>
              HospitalCommand
            </div>
            <div style={{ color: '#5A7A9A', fontSize: 10 }}>{hospitalName}</div>
          </div>
        </div>

        {/* Live stats */}
        <div style={{ display: 'flex', gap: 0, marginLeft: 'auto', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 7, overflow: 'hidden' }}>
          {[
            { label: 'BEDS', value: beds.available_beds, color: '#6EE7B7' },
            { label: 'ICU',  value: beds.icu_available,  color: '#4DD9CB' },
            { label: 'WAIT', value: beds.er_wait_min+'m',color: '#FFD166' },
            { label: 'STATUS', value: beds.status,       color: beds.status === 'Full' ? '#FF6B6B' : '#6EE7B7' },
          ].map(s => (
            <div key={s.label} style={{ padding: '5px 14px', borderRight: '1px solid rgba(255,255,255,0.07)', textAlign: 'center' }}>
              <div style={{ fontFamily: 'monospace', fontSize: 14, fontWeight: 700, color: s.color }}>{s.value}</div>
              <div style={{ fontSize: 9, color: '#7A8FA8', marginTop: 1, letterSpacing: '0.3px' }}>{s.label}</div>
            </div>
          ))}
        </div>

        {/* Live badge */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '3px 10px', background: 'rgba(200,39,31,0.25)', border: '1px solid rgba(229,57,41,0.4)', borderRadius: 20 }}>
          <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#FF6B6B', animation: 'none' }}>●</div>
          <div style={{ fontFamily: 'monospace', fontSize: 9, color: '#FF8A80', letterSpacing: '1px' }}>LIVE</div>
        </div>

        <div style={{ fontFamily: 'monospace', fontSize: 12, color: '#5A7A9A' }}>{time}</div>

        <button
          onClick={() => { sessionStorage.clear(); navigate('/') }}
          style={{ background: 'rgba(239,68,68,0.2)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: 6, padding: '4px 12px', color: '#FF8A80', cursor: 'pointer', fontSize: 12 }}
        >
          Sign Out
        </button>
      </div>

      {/* ── TABS ── */}
      <div style={{ background: '#fff', borderBottom: '1px solid #DDE4F0', display: 'flex', padding: '0 20px', gap: 0 }}>
        {[
          { id: 'beds',   label: '🛏️ Bed Management',  desc: 'Update live bed counts' },
          { id: 'bays',   label: '🏥 Bay Board',        desc: 'Manage ER bays' },
          { id: 'status', label: '⚙️ Hospital Status',  desc: 'Set availability' },
          { id: 'feed',   label: `📋 Activity Feed`,    desc: 'Change log' },
        ].map(t => (
          <button
            key={t.id}
            onClick={() => setActiveTab(t.id)}
            style={{
              padding: '10px 18px',
              border: 'none',
              borderBottom: `2px solid ${activeTab === t.id ? '#1A5DC8' : 'transparent'}`,
              background: 'transparent',
              color: activeTab === t.id ? '#1A5DC8' : '#5B6E86',
              fontWeight: activeTab === t.id ? 700 : 500,
              cursor: 'pointer',
              fontSize: 13,
              fontFamily: 'Plus Jakarta Sans, sans-serif',
            }}
          >
            {t.label}
          </button>
        ))}
      </div>

      <div style={{ padding: '24px 24px 48px', maxWidth: 1100, margin: '0 auto' }}>

        {/* ── TAB: BED MANAGEMENT ── */}
        {activeTab === 'beds' && (
          <div>
            <div style={{ marginBottom: 20 }}>
              <h2 style={{ fontSize: 18, fontWeight: 800, color: '#0B1523', marginBottom: 4 }}>
                Live Bed & Resource Update
              </h2>
              <p style={{ fontSize: 13, color: '#5B6E86' }}>
                Changes push instantly to Firebase — patients see live data within seconds.
              </p>
            </div>

            {savedMsg && (
              <div style={{
                background: '#F0FDF4', border: '1px solid #86EFAC', borderRadius: 10,
                padding: '12px 16px', marginBottom: 20, color: '#16A34A', fontWeight: 600, fontSize: 13,
              }}>
                {savedMsg}
              </div>
            )}

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16, marginBottom: 24 }}>
              {[
                { key: 'available_beds',   label: 'Available Beds',  icon: '🛏️', color: '#22C55E', max: 2000 },
                { key: 'icu_available',    label: 'ICU Available',   icon: '🫀', color: '#EF4444', max: 500 },
                { key: 'trauma_available', label: 'Trauma Beds',     icon: '🚨', color: '#F59E0B', max: 200 },
                { key: 'burn_available',   label: 'Burn Unit Beds',  icon: '🔥', color: '#A855F7', max: 100 },
                { key: 'er_wait_min',      label: 'ER Wait (min)',   icon: '⏱️', color: '#3B82F6', max: 180 },
              ].map(field => (
                <div key={field.key} style={{
                  background: '#fff', border: '1.5px solid #DDE4F0',
                  borderRadius: 14, padding: 20,
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
                    <div style={{ fontSize: 20 }}>{field.icon}</div>
                    <div style={{ fontWeight: 600, fontSize: 13, color: '#2E3D52' }}>{field.label}</div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <button
                      onClick={() => handleBedChange(field.key, (beds[field.key] || 0) - 1)}
                      style={{
                        width: 32, height: 32, borderRadius: 8,
                        border: '1px solid #DDE4F0', background: '#EEF2F8',
                        cursor: 'pointer', fontSize: 18, fontWeight: 700, color: '#5B6E86',
                      }}
                    >−</button>
                    <input
                      type="number"
                      value={beds[field.key] || 0}
                      min={0} max={field.max}
                      onChange={e => handleBedChange(field.key, e.target.value)}
                      style={{
                        flex: 1, textAlign: 'center',
                        fontFamily: 'monospace', fontSize: 28, fontWeight: 700,
                        color: field.color, border: 'none',
                        background: 'transparent', outline: 'none',
                      }}
                    />
                    <button
                      onClick={() => handleBedChange(field.key, (beds[field.key] || 0) + 1)}
                      style={{
                        width: 32, height: 32, borderRadius: 8,
                        border: '1px solid #DDE4F0', background: '#EEF2F8',
                        cursor: 'pointer', fontSize: 18, fontWeight: 700, color: '#5B6E86',
                      }}
                    >+</button>
                  </div>
                  <input
                    type="range" min={0} max={field.max}
                    value={beds[field.key] || 0}
                    onChange={e => handleBedChange(field.key, e.target.value)}
                    style={{ width: '100%', marginTop: 10, accentColor: field.color }}
                  />
                </div>
              ))}
            </div>

            <button
              onClick={handleSave}
              disabled={saving}
              style={{
                background: saving ? '#94A3B8' : '#1A5DC8',
                color: '#fff', border: 'none', borderRadius: 10,
                padding: '14px 32px', fontSize: 15, fontWeight: 700,
                cursor: saving ? 'default' : 'pointer',
                boxShadow: '0 4px 14px rgba(26,93,200,0.35)',
                transition: 'all 0.2s',
              }}
            >
              {saving ? '⏳ Pushing to Firebase...' : '🔴 PUSH LIVE UPDATE'}
            </button>

            {!FIREBASE_ENABLED && (
              <div style={{
                marginTop: 16, padding: '12px 16px',
                background: '#FFFBEB', border: '1px solid #FCD68A',
                borderRadius: 10, fontSize: 12, color: '#92400E',
              }}>
                ⚠️ Firebase not configured — changes saved locally only.
                Add your Firebase keys to <code>frontend/.env</code> for real-time sync.
              </div>
            )}
          </div>
        )}

        {/* ── TAB: BAY BOARD ── */}
        {activeTab === 'bays' && (
          <div>
            <div style={{ marginBottom: 20 }}>
              <h2 style={{ fontSize: 18, fontWeight: 800, color: '#0B1523', marginBottom: 4 }}>ER Bay Board</h2>
              <p style={{ fontSize: 13, color: '#5B6E86' }}>
                Click a bay to change its status. Free/Occupied changes update available bed count automatically.
              </p>
            </div>

            {/* Bay stats */}
            <div style={{ display: 'flex', gap: 12, marginBottom: 20, flexWrap: 'wrap' }}>
              {[
                { label: 'Free',     value: freeBays,                                           color: '#22C55E' },
                { label: 'Occupied', value: occupiedBays,                                        color: '#EF4444' },
                { label: 'Reserved', value: bays.filter(b => b.status==='reserved').length,     color: '#3B82F6' },
                { label: 'Cleaning', value: bays.filter(b => b.status==='cleaning').length,     color: '#F59E0B' },
                { label: 'Total',    value: bays.length,                                         color: '#6B7280' },
              ].map(s => (
                <div key={s.label} style={{
                  background: '#fff', border: '1px solid #DDE4F0', borderRadius: 10,
                  padding: '12px 20px', textAlign: 'center',
                }}>
                  <div style={{ fontFamily: 'monospace', fontSize: 24, fontWeight: 700, color: s.color }}>{s.value}</div>
                  <div style={{ fontSize: 11, color: '#5B6E86', marginTop: 2 }}>{s.label}</div>
                </div>
              ))}
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 12 }}>
              {bays.map((bay, idx) => {
                const sc = statusColors[bay.status] || statusColors.free
                return (
                  <div key={bay.id} style={{
                    background: sc.bg,
                    border: `1.5px solid ${sc.border}`,
                    borderRadius: 12, padding: 14,
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                      <div style={{ width: 8, height: 8, borderRadius: '50%', background: sc.dot, flexShrink: 0 }} />
                      <div style={{ fontFamily: 'monospace', fontSize: 11, fontWeight: 700, color: '#5B6E86' }}>{bay.name}</div>
                      <div style={{ marginLeft: 'auto', fontSize: 10, background: sc.dot, color: '#fff', padding: '1px 6px', borderRadius: 8, fontWeight: 600 }}>
                        {sc.label}
                      </div>
                    </div>
                    <div style={{ fontSize: 13, fontWeight: 600, color: '#0B1523', marginBottom: 4 }}>
                      {bay.patient || '—'}
                    </div>
                    {bay.diag && <div style={{ fontSize: 11, color: '#5B6E86', marginBottom: 8 }}>{bay.diag}</div>}

                    {/* Status buttons */}
                    <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap', marginTop: 8 }}>
                      {['free', 'occupied', 'reserved', 'cleaning'].map(s => (
                        <button
                          key={s}
                          onClick={() => handleBayStatusChange(idx, s)}
                          style={{
                            padding: '3px 8px',
                            borderRadius: 6,
                            border: `1px solid ${bay.status === s ? statusColors[s].dot : '#DDE4F0'}`,
                            background: bay.status === s ? statusColors[s].dot : 'transparent',
                            color: bay.status === s ? '#fff' : '#5B6E86',
                            fontSize: 10, fontWeight: 600, cursor: 'pointer',
                            textTransform: 'capitalize',
                          }}
                        >
                          {s}
                        </button>
                      ))}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* ── TAB: HOSPITAL STATUS ── */}
        {activeTab === 'status' && (
          <div>
            <div style={{ marginBottom: 20 }}>
              <h2 style={{ fontSize: 18, fontWeight: 800, color: '#0B1523', marginBottom: 4 }}>Hospital Availability Status</h2>
              <p style={{ fontSize: 13, color: '#5B6E86' }}>
                Setting to "Full" removes this hospital from emergency routing suggestions.
              </p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 14, marginBottom: 24 }}>
              {[
                { value: 'Available', icon: '✅', color: '#22C55E', desc: 'Accepting all patients' },
                { value: 'Limited',   icon: '⚠️', color: '#F59E0B', desc: 'Limited capacity' },
                { value: 'Full',      icon: '🔴', color: '#EF4444', desc: 'Not accepting patients' },
                { value: 'Emergency Only', icon: '🚨', color: '#A855F7', desc: 'Critical cases only' },
              ].map(s => (
                <button
                  key={s.value}
                  onClick={() => handleStatusChange(s.value)}
                  style={{
                    background: beds.status === s.value ? s.color : '#fff',
                    border: `2px solid ${s.color}`,
                    borderRadius: 14, padding: '20px 16px',
                    cursor: 'pointer', textAlign: 'center',
                    transition: 'all 0.2s',
                    transform: beds.status === s.value ? 'scale(1.03)' : 'scale(1)',
                  }}
                >
                  <div style={{ fontSize: 28, marginBottom: 8 }}>{s.icon}</div>
                  <div style={{
                    fontWeight: 700, fontSize: 14,
                    color: beds.status === s.value ? '#fff' : '#0B1523',
                    marginBottom: 4,
                  }}>{s.value}</div>
                  <div style={{ fontSize: 11, color: beds.status === s.value ? 'rgba(255,255,255,0.8)' : '#5B6E86' }}>
                    {s.desc}
                  </div>
                </button>
              ))}
            </div>

            {/* ER Wait Quick Set */}
            <div style={{ background: '#fff', border: '1px solid #DDE4F0', borderRadius: 14, padding: 20, maxWidth: 400 }}>
              <div style={{ fontWeight: 700, marginBottom: 12 }}>⏱️ Quick ER Wait Time</div>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                {[5, 10, 15, 20, 30, 45, 60].map(min => (
                  <button
                    key={min}
                    onClick={() => handleERWaitChange(min)}
                    style={{
                      padding: '8px 14px',
                      background: beds.er_wait_min === min ? '#1A5DC8' : '#EEF2F8',
                      color: beds.er_wait_min === min ? '#fff' : '#2E3D52',
                      border: '1px solid #DDE4F0',
                      borderRadius: 8, cursor: 'pointer', fontWeight: 600, fontSize: 13,
                    }}
                  >
                    {min}m
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ── TAB: ACTIVITY FEED ── */}
        {activeTab === 'feed' && (
          <div>
            <div style={{ marginBottom: 20 }}>
              <h2 style={{ fontSize: 18, fontWeight: 800, color: '#0B1523', marginBottom: 4 }}>Activity Feed</h2>
              <p style={{ fontSize: 13, color: '#5B6E86' }}>All changes made during this session.</p>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {feed.map((item, i) => (
                <div key={i} style={{
                  background: '#fff',
                  border: `1px solid ${item.type === 'ok' ? '#86EFAC' : item.type === 'alert' ? '#FECDCA' : '#DDE4F0'}`,
                  borderLeft: `3px solid ${item.type === 'ok' ? '#22C55E' : item.type === 'alert' ? '#EF4444' : '#3B82F6'}`,
                  borderRadius: 10,
                  padding: '10px 14px',
                  display: 'flex', alignItems: 'center', gap: 12,
                }}>
                  <div style={{ fontFamily: 'monospace', fontSize: 11, color: '#5B6E86', flexShrink: 0 }}>{item.time}</div>
                  <div style={{ fontSize: 13, color: '#0B1523', flex: 1 }}>{item.msg}</div>
                  <div style={{ fontSize: 12 }}>
                    {item.type === 'ok' ? '✅' : item.type === 'alert' ? '⚠️' : 'ℹ️'}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
