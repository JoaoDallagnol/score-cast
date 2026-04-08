const BASE = 'http://localhost:8080/api'

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
  getTeams: () => req('/teams'),

  // Championships
  getChampionships: () => req('/championships'),
  getChampionship: (id) => req(`/championships/${id}`),
  createChampionship: (name) => req('/championships', { method: 'POST', body: JSON.stringify({ name }) }),

  // Schools
  getSchools: () => req('/schools'),
  createSchool: (name) => req('/schools', { method: 'POST', body: JSON.stringify({ name }) }),

  // Students
  getStudents: (championshipId) => req(`/championships/${championshipId}/students`),
  createStudent: (championshipId, data) =>
    req(`/championships/${championshipId}/students`, { method: 'POST', body: JSON.stringify(data) }),

  // Matches
  getMatches: (championshipId) => req(`/championships/${championshipId}/matches`),
  createMatch: (championshipId, data) =>
    req(`/championships/${championshipId}/matches`, { method: 'POST', body: JSON.stringify(data) }),
  setResult: (matchId, data) =>
    req(`/matches/${matchId}/result`, { method: 'PATCH', body: JSON.stringify(data) }),

  // Predictions
  savePrediction: (studentId, matchId, data) =>
    req(`/students/${studentId}/predictions/${matchId}`, { method: 'PUT', body: JSON.stringify(data) }),

  // Admin
  backup: () => req('/admin/db/backup', { method: 'POST' }),
  clearAll: () => req('/admin/db/clear', { method: 'DELETE' }),

  // Ranking
  getRanking: (championshipId, params = {}) => {
    const qs = new URLSearchParams(params).toString()
    return req(`/championships/${championshipId}/ranking${qs ? `?${qs}` : ''}`)
  },
}
