import { useEffect, useState } from 'react'
import { api } from '@/api'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select'

export default function RankingTab({ championshipId }) {
  const [ranking, setRanking] = useState([])
  const [schools, setSchools] = useState([])
  const [schoolId, setSchoolId] = useState('')
  const [serie, setSerie] = useState('')
  const [error, setError] = useState('')

  async function load(params = {}) {
    try {
      const [r, sc] = await Promise.all([
        api.getRanking(championshipId, params),
        api.getSchools(),
      ])
      setRanking(r)
      setSchools(sc)
    } catch (e) {
      setError(e.message)
    }
  }

  useEffect(() => { load() }, [championshipId])

  function handleFilter(e) {
    e.preventDefault()
    const params = {}
    if (schoolId) params.schoolId = schoolId
    if (serie.trim()) params.serie = serie.trim()
    load(params)
  }

  return (
    <div className="space-y-6">
      <form onSubmit={handleFilter} className="flex flex-wrap gap-3 items-end max-w-xl">
        <div className="space-y-1 w-48">
          <Label>Escola</Label>
          <Select value={schoolId} onValueChange={setSchoolId}>
            <SelectTrigger><SelectValue placeholder="Todas" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="">Todas</SelectItem>
              {schools.map((s) => <SelectItem key={s.id} value={String(s.id)}>{s.name}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1">
          <Label>Série</Label>
          <Input placeholder="Ex: 9A" value={serie} onChange={(e) => setSerie(e.target.value)} className="w-28" />
        </div>
        <Button type="submit">Filtrar</Button>
      </form>

      {error && <p className="text-sm text-red-600">{error}</p>}

      <div className="overflow-x-auto rounded-lg border border-slate-200">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 text-slate-600">
            <tr>
              <th className="px-4 py-2 text-left">#</th>
              <th className="px-4 py-2 text-left">Aluno</th>
              <th className="px-4 py-2 text-left">Escola</th>
              <th className="px-4 py-2 text-left">Série</th>
              <th className="px-4 py-2 text-right">Pontos</th>
            </tr>
          </thead>
          <tbody>
            {ranking.length === 0 && (
              <tr><td colSpan={5} className="px-4 py-4 text-center text-slate-400">Sem dados.</td></tr>
            )}
            {ranking.map((r, i) => (
              <tr key={r.studentId ?? i} className="border-t border-slate-100 hover:bg-slate-50">
                <td className="px-4 py-2 font-bold text-slate-500">{i + 1}</td>
                <td className="px-4 py-2 font-medium">{r.studentName ?? r.name}</td>
                <td className="px-4 py-2 text-slate-500">{r.schoolName}</td>
                <td className="px-4 py-2 text-slate-500">{r.serie}</td>
                <td className="px-4 py-2 text-right font-bold">{r.points ?? r.totalPoints ?? 0}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
