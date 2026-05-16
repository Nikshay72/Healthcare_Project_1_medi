import axios from 'axios'

const BASE = '/api'

export const api = {
  // Hospitals
  getHospitals: ()           => axios.get(`${BASE}/hospitals`),
  getHospital:  (id)         => axios.get(`${BASE}/hospital/${id}`),
  getBudgetHospitals: ()     => axios.get(`${BASE}/budget_hospitals`),

  // Routing
  findRoute: (payload)       => axios.post(`${BASE}/route`, payload),

  // Ambulances
  getAmbulances: ()          => axios.get(`${BASE}/ambulances`),

  // Emergencies
  getEmergencies: ()         => axios.get(`${BASE}/emergencies`),

  // Stats
  getStats: ()               => axios.get(`${BASE}/stats`),

  // Alert
  sendAlert: (payload)       => axios.post(`${BASE}/alert`, payload),
}
