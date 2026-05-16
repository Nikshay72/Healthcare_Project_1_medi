import React, { useEffect, useState } from 'react'
import { useHospitals } from '../hooks/useHospitals'
import HospitalCard from '../components/HospitalCard'
import ErrorBanner from '../components/ErrorBanner'

export default function HospitalDirectory() {
  const { hospitals, loading, error } = useHospitals()
  const [filtered, setFiltered]   = useState([])
  const [search, setSearch]       = useState('')
  const [filterType, setFilterType]     = useState('All')
  const [filterBudget, setFilterBudget] = useState('All')

  useEffect(() => {
    let f = hospitals
    if (search)              f = f.filter(h => h.name.toLowerCase().includes(search.toLowerCase()) || h.address.toLowerCase().includes(search.toLowerCase()))
    if (filterType   !== 'All') f = f.filter(h => h.type       === filterType)
    if (filterBudget !== 'All') f = f.filter(h => h.budget_tier === filterBudget)
    setFiltered(f)
  }, [search, filterType, filterBudget, hospitals])

  if (loading) return <div className="loading-wrap"><div className="spinner" />Loading hospitals...</div>

  return (
    <div>
      <div className="page-header">
        <h1>Hospital Directory</h1>
        <p>All {hospitals.length} hospitals in Jodhpur with live bed availability</p>
      </div>

      {error && <ErrorBanner message={error} />}

      {/* Filters */}
      <div style={{ display: 'flex', gap: 12, marginBottom: 20, flexWrap: 'wrap', alignItems: 'center' }}>
        <div className="search-bar" style={{ flex: 1, minWidth: 240, marginBottom: 0 }}>
          <span>🔍</span>
          <input
            placeholder="Search hospitals, address..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
        <select className="form-select" style={{ width: 150 }} value={filterType} onChange={e => setFilterType(e.target.value)}>
          <option value="All">All Types</option>
          <option value="Government">Government</option>
          <option value="Private">Private</option>
        </select>
        <select className="form-select" style={{ width: 160 }} value={filterBudget} onChange={e => setFilterBudget(e.target.value)}>
          <option value="All">All Budgets</option>
          <option value="Low">Low / Govt</option>
          <option value="Medium">Medium</option>
          <option value="High">Premium</option>
        </select>
        <span style={{ fontSize: 12, color: 'var(--text3)' }}>{filtered.length} results</span>
      </div>

      <div className="hospitals-grid">
        {filtered.map(h => <HospitalCard key={h.id} hospital={h} />)}
      </div>
    </div>
  )
}
