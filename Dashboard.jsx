import React from 'react'
import { useNavigate } from 'react-router-dom'
import { useStats } from '../hooks/useStats'
import { useHospitals } from '../hooks/useHospitals'
import StatCard from '../components/StatCard'
import ErrorBanner from '../components/ErrorBanner'

export default function Dashboard({ setActivePage }) {
  const navigate = useNavigate()
  const { stats, loading: statsLoading, error: statsError } = useStats()
  const { hospitals: allHospitals, loading: hospLoading, error: hospError } = useHospitals()
  const hospitals = allHospitals.slice(0, 6)
  const loading = statsLoading || hospLoading

  const goTo = (page, path) => {
    setActivePage(page)
    navigate(path)
  }

  if (loading) return (
    <div className="loading-wrap">
      <div className="spinner" />
      Loading live data...
    </div>
  )

  const error = statsError || hospError

  const STAT_CARDS = [
    { icon: '🏥', label: 'Total Hospitals',   value: stats?.total_hospitals,  iconBg: '#EEF0FF', valueColor: 'var(--primary)' },
    { icon: '🛏️', label: 'Available Beds',    value: stats?.available_beds,   iconBg: '#F0FDF4', valueColor: 'var(--green)' },
    { icon: '🫀', label: 'ICU Available',      value: stats?.icu_available,    iconBg: '#FEF2F2', valueColor: 'var(--red)' },
    { icon: '🚑', label: 'Ambulances Ready',  value: stats?.ambulances_ready, iconBg: '#FFFBEB', valueColor: 'var(--amber)' },
    { icon: '⏱️', label: 'Avg Response',       value: stats?.avg_response_time, iconBg: '#EFF6FF', valueColor: 'var(--blue)' },
    { icon: '📋', label: 'Emergencies Today', value: stats?.emergencies_today ?? 0, iconBg: '#FAF5FF', valueColor: 'var(--purple)' },
  ]

  return (
    <div>
      <div className="page-header">
        <h1>Emergency Network Dashboard</h1>
        <p>Real-time status of Jodhpur's hospital and ambulance network</p>
      </div>

      {error && <ErrorBanner message={error} />}

      <div className="stat-grid">
        {STAT_CARDS.map(s => (
          <StatCard
            key={s.label}
            icon={s.icon}
            label={s.label}
            value={s.value}
            iconBg={s.iconBg}
            valueColor={s.valueColor}
          />
        ))}
      </div>

      {/* Quick Actions */}
      <div className="card" style={{ marginBottom: 20 }}>
        <div className="card-header">
          <span>⚡</span>
          <h2>Quick Actions</h2>
        </div>
        <div className="card-body" style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
          <button className="btn btn-red" onClick={() => goTo('emergency-router', '/emergency-router')}>
            🚑 Route Emergency
          </button>
          <button className="btn btn-primary" onClick={() => goTo('hospitals', '/hospitals')}>
            🏥 Hospital Directory
          </button>
          <button className="btn btn-outline" onClick={() => goTo('ambulances', '/ambulances')}>
            🗺️ Ambulance Map
          </button>
          <button className="btn btn-outline" onClick={() => goTo('budget', '/budget')}>
            💰 Budget Finder
          </button>
        </div>
      </div>

      {/* Hospital Overview Table */}
      <div className="card">
        <div className="card-header">
          <span>🏥</span>
          <h2>Hospital Status Overview</h2>
          <button className="btn btn-outline btn-sm" onClick={() => goTo('hospitals', '/hospitals')}>
            View All →
          </button>
        </div>
        <div className="card-body" style={{ padding: 0 }}>
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Hospital</th>
                  <th>Type</th>
                  <th>Beds Available</th>
                  <th>ICU</th>
                  <th>ER Wait</th>
                  <th>Status</th>
                  <th>Rating</th>
                </tr>
              </thead>
              <tbody>
                {hospitals.map(h => (
                  <tr
                    key={h.id}
                    style={{ cursor: 'pointer' }}
                    onClick={() => navigate(`/hospitals/${h.id}`)}
                  >
                    <td>
                      <div style={{ fontWeight: 700, fontSize: 13 }}>{h.name}</div>
                      <div style={{ fontSize: 11, color: 'var(--text3)' }}>{h.address?.split(',')[0]}</div>
                    </td>
                    <td>
                      <span className={`badge ${h.type === 'Government' ? 'green' : 'blue'}`}>
                        {h.type}
                      </span>
                    </td>
                    <td style={{ fontWeight: 700 }}>{h.available_beds}</td>
                    <td style={{ fontWeight: 700 }}>{h.icu_available}</td>
                    <td>
                      <span className={`badge ${h.er_wait_min <= 10 ? 'green' : h.er_wait_min <= 20 ? 'amber' : 'red'}`}>
                        {h.er_wait_min} min
                      </span>
                    </td>
                    <td>
                      <span className={`badge ${h.status === 'Available' ? 'green' : 'red'}`}>
                        {h.status}
                      </span>
                    </td>
                    <td>
                      <span className="stars">{'★'.repeat(Math.round(h.rating))}</span>
                      <span style={{ fontSize: 11, color: 'var(--text3)', marginLeft: 4 }}>{h.rating}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}
