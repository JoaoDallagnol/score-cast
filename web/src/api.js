// Em dev (npm run dev), usa localhost:8080/api. Em produção (servido pelo Spring Boot), usa /api.
const BASE = import.meta.env.DEV ? 'http://localhost:8080/api' : '/api'

async function req(path, options = {}) {
  const res = await fetch(`${BASE}${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  })
  if (!res.ok) {
    const text = await res.text().catch(() => res.statusText)
    throw new Error(text || res.statusText)
  }
  const text = await res.text()
  return text ? JSON.parse(text) : null
}

export const api = {
  // Teams
  getTeams: (championshipId) => req(`/championships/${championshipId}/teams`),
  createTeam: (championshipId, name) =>
    req(`/championships/${championshipId}/teams`, { method: 'POST', body: JSON.stringify({ name }) }),
  updateTeam: (championshipId, teamId, name) =>
    req(`/championships/${championshipId}/teams/${teamId}`, { method: 'PUT', body: JSON.stringify({ name }) }),
  deleteTeam: (championshipId, teamId) =>
    req(`/championships/${championshipId}/teams/${teamId}`, { method: 'DELETE' }),

  // Championships
  getChampionships: () => req('/championships'),
  getChampionship: (id) => req(`/championships/${id}`),
  createChampionship: (name) => req('/championships', { method: 'POST', body: JSON.stringify({ name }) }),
  updateChampionship: (id, name) => req(`/championships/${id}`, { method: 'PUT', body: JSON.stringify({ name }) }),
  deleteChampionship: (id) => req(`/championships/${id}`, { method: 'DELETE' }),

  // Schools
  getSchools: () => req('/schools'),
  createSchool: (name) => req('/schools', { method: 'POST', body: JSON.stringify({ name }) }),
  updateSchool: (id, name) => req(`/schools/${id}`, { method: 'PUT', body: JSON.stringify({ name }) }),
  deleteSchool: (id) => req(`/schools/${id}`, { method: 'DELETE' }),

  // Students
  getStudents: (championshipId, params = {}) => {
    const filtered = Object.fromEntries(Object.entries(params).filter(([, v]) => v !== undefined))
    const qs = new URLSearchParams(filtered).toString()
    return req(`/championships/${championshipId}/students${qs ? `?${qs}` : ''}`)
  },
  createStudent: (championshipId, data) =>
    req(`/championships/${championshipId}/students`, { method: 'POST', body: JSON.stringify(data) }),
  updateStudent: (championshipId, studentId, data) =>
    req(`/championships/${championshipId}/students/${studentId}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteStudent: (championshipId, studentId) =>
    req(`/championships/${championshipId}/students/${studentId}`, { method: 'DELETE' }),

  // Matches
  getMatches: (championshipId, sort = 'desc') => req(`/championships/${championshipId}/matches?sort=${sort}`),
  createMatch: (championshipId, data) =>
    req(`/championships/${championshipId}/matches`, { method: 'POST', body: JSON.stringify(data) }),
  setResult: (matchId, data) =>
    req(`/matches/${matchId}/result`, { method: 'PATCH', body: JSON.stringify(data) }),
  deleteMatch: (championshipId, matchId) =>
    req(`/championships/${championshipId}/matches/${matchId}`, { method: 'DELETE' }),

  // Predictions
  savePrediction: (studentId, matchId, data) =>
    req(`/students/${studentId}/predictions/${matchId}`, { method: 'PUT', body: JSON.stringify(data) }),
  getPredictions: (studentId, championshipId, sort = 'desc') =>
    req(`/students/${studentId}/predictions?championshipId=${championshipId}&sort=${sort}`),
  savePredictionsBatch: (studentId, data) =>
    req(`/students/${studentId}/predictions/batch`, { method: 'POST', body: JSON.stringify(data) }),

  // Admin
  backup: () => req('/admin/db/backup', { method: 'POST' }),
  clearAll: () => req('/admin/db/clear', { method: 'DELETE' }),

  // Ranking
  getRanking: (championshipId, params = {}) => {
    const qs = new URLSearchParams(params).toString()
    return req(`/championships/${championshipId}/ranking${qs ? `?${qs}` : ''}`)
  },
}
