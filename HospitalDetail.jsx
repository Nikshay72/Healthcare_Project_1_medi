import React, { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { api } from '../utils/api'

export default function HospitalDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [h, setH] = useState(null)
  const [loading, setLoading] = useState(true)
  const [alertMsg, setAlertMsg] = useState('')

  useEffect(() => {
    api.getHospital(id).then(r => {
      setH(r.data)
      setLoading(false)
    })
  }, [id])

  const handleAlert = async () => {
    const res = await api.sendAlert({ hospital_id: parseInt(id), condition: 'General Emergency', eta: 10 })
    setAlertMsg(res.data.message)
  }

  if (loading) return <div className="loading-wrap"><div className="spinner" />Loading...</div>
  if (!h) return <div className="loading-wrap">Hospital not found</div>

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 24 }}>
        <button className="btn btn-outline btn-sm" onClick={() => navigate(-1)}>← Back</button>
        <div>
          <h1 style={{ fontSize: 20, fontWeight: 800 }}>{h.name}</h1>
          <p style={{ fontSize: 12, color: 'var(--text3)' }}>📍 {h.address} &nbsp;|&nbsp; 📞 {h.phone}</p>
        </div>
        <div style={{ marginLeft: 'auto', display: 'flex', gap: 8 }}>
          <button className="btn btn-red" onClick={handleAlert}>🔔 Send Pre-Alert</button>
        </div>
      </div>

      {alertMsg && <div className="alert alert-success">{alertMsg}</div>}

      <div className="grid-2" style={{ marginBottom: 20 }}>
        {/* Key stats */}
        <div className="card">
          <div className="card-header"><span>🛏️</span><h2>Bed Availability</h2></div>
          <div className="card-body">
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              {[
                { label: 'Available Beds', val: h.available_beds, tot: h.total_beds, color: 'var(--green)' },
                { label: 'ICU Available', val: h.icu_available, tot: h.icu_total, color: 'var(--red)' },
                { label: 'Trauma Beds', val: h.trauma_available, tot: h.trauma_total, color: 'var(--amber)' },
                { label: 'Burn Unit', val: h.burn_available, tot: h.burn_total, color: 'var(--purple)' },
              ].map(item => (
                <div key={item.label} style={{ background: 'var(--bg2)', borderRadius: 10, padding: '14px 16px' }}>
                  <div style={{ fontSize: 22, fontWeight: 800, color: item.color }}>{item.val}</div>
                  <div style={{ fontSize: 11, color: 'var(--text3)', fontWeight: 600 }}>{item.label}</div>
                  <div style={{ fontSize: 11, color: 'var(--text4)' }}>of {item.tot} total</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Info */}
        <div className="card">
          <div className="card-header"><span>ℹ️</span><h2>Hospital Info</h2></div>
          <div className="card-body">
            <table style={{ fontSize: 13, width: '100%' }}>
              <tbody>
                {[
                  ['Type', h.type], ['Est.', h.established],
                  ['Accreditation', h.accreditation], ['ER Wait', `${h.er_wait_min} min`],
                  ['Ambulances', h.ambulances], ['Rating', `${h.rating} ★`],
                  ['Budget Tier', h.budget_tier],
                ].map(([k, v]) => (
                  <tr key={k}>
                    <td style={{ fontWeight: 600, color: 'var(--text3)', paddingBottom: 8, width: '45%' }}>{k}</td>
                    <td style={{ fontWeight: 500 }}>{v}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Fees */}
      <div className="card" style={{ marginBottom: 20 }}>
        <div className="card-header"><span>💰</span><h2>Fee Structure</h2></div>
        <div className="card-body" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: 12 }}>
          {[
            { label: 'Consultation', val: `₹${h.consultation_fee}` },
            { label: 'Emergency Fee', val: `₹${h.emergency_fee}` },
            { label: 'ICU / Day', val: `₹${h.icu_per_day}` },
            { label: 'Surgery Range', val: `₹${h.surgery_range}` },
          ].map(item => (
            <div key={item.label} style={{ background: 'var(--bg2)', borderRadius: 10, padding: '14px 16px', textAlign: 'center' }}>
              <div style={{ fontSize: 15, fontWeight: 800 }}>{item.val}</div>
              <div style={{ fontSize: 11, color: 'var(--text3)', marginTop: 4 }}>{item.label}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="grid-2" style={{ marginBottom: 20 }}>
        {/* Equipment */}
        <div className="card">
          <div className="card-header"><span>🔬</span><h2>Equipment</h2></div>
          <div className="card-body">
            {Object.entries(h.equipment || {}).map(([eq, has]) => (
              <div key={eq} style={{ display: 'flex', justifyContent: 'space-between', padding: '7px 0', borderBottom: '1px solid var(--border)', fontSize: 13 }}>
                <span>{eq}</span>
                <span className={`badge ${has ? 'green' : 'red'}`}>{has ? '✓ Available' : '✗ No'}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Specialists */}
        <div className="card">
          <div className="card-header"><span>👨‍⚕️</span><h2>Specialists</h2></div>
          <div className="card-body">
            {Object.entries(h.specialists || {}).map(([sp, has]) => (
              <div key={sp} style={{ display: 'flex', justifyContent: 'space-between', padding: '7px 0', borderBottom: '1px solid var(--border)', fontSize: 13 }}>
                <span>{sp}</span>
                <span className={`badge ${has ? 'green' : 'red'}`}>{has ? '✓ On Staff' : '✗ No'}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* About */}
      <div className="card" style={{ marginBottom: 20 }}>
        <div className="card-header"><span>📝</span><h2>About</h2></div>
        <div className="card-body">
          <p style={{ fontSize: 13, color: 'var(--text2)', lineHeight: 1.7 }}>{h.about}</p>
          {h.key_doctors && (
            <div style={{ marginTop: 14 }}>
              <div style={{ fontWeight: 700, fontSize: 12, marginBottom: 8, color: 'var(--text3)', textTransform: 'uppercase' }}>Key Doctors</div>
              {h.key_doctors.map(d => <div key={d} style={{ fontSize: 13, padding: '4px 0', color: 'var(--text2)' }}>👨‍⚕️ {d}</div>)}
            </div>
          )}
        </div>
      </div>

      {/* Services */}
      <div className="card">
        <div className="card-header"><span>🏥</span><h2>Services Offered</h2></div>
        <div className="card-body" style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
          {(h.services || []).map(s => (
            <span key={s} className="chip" style={{ padding: '5px 12px', fontSize: 12 }}>{s}</span>
          ))}
        </div>
      </div>
    </div>
  )
}
