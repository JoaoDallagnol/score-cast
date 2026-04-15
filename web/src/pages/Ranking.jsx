import { useEffect, useState } from 'react'
import { api } from '@/api'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select'
import { Label } from '@/components/ui/label'

export default function Ranking() {
  const [championships, setChampionships] = useState([])
  const [schools, setSchools] = useState([])
  const [ranking, setRanking] = useState([])
  const [championshipId, setChampionshipId] = useState('')
  const [schoolId, setSchoolId] = useState('all')
  const [serie, setSerie] = useState('')
  const [error, setError] = useState('')

  useEffect(() => {
    api.getChampionships().then(setChampionships).catch((e) => setError(e.message))
  }, [])

  async function onChampionshipChange(val) {
    setChampionshipId(val)
    setRanking([])
    setSchoolId('all')
    setSerie('')
    setError('')
    try {
      const [r, sc] = await Promise.all([api.getRanking(val, {}), api.getSchools()])
      setRanking(r)
      setSchools(sc)
    } catch (e) {
      setError(e.message)
    }
  }

  function handleFilter(e) {
    e.preventDefault()
    const params = {}
    if (schoolId && schoolId !== 'all') params.schoolId = schoolId
    if (serie.trim()) params.serie = serie.trim()
    api.getRanking(championshipId, params).then(setRanking).catch((e) => setError(e.message))
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Ranking</h1>

      <div className="space-y-1 max-w-md">
        <Label>Campeonato</Label>
        <Select value={championshipId} onValueChange={onChampionshipChange}>
          <SelectTrigger><SelectValue placeholder="Selecione um campeonato" /></SelectTrigger>
          <SelectContent>
            {championships.map((c) => (
              <SelectItem key={c.id} value={String(c.id)}>{c.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}

      {championshipId && (
        <>
          <form onSubmit={handleFilter} className="flex flex-wrap gap-3 items-end max-w-xl">
            <div className="space-y-1 w-48">
              <Label>Escola</Label>
              <Select value={schoolId} onValueChange={setSchoolId}>
                <SelectTrigger><SelectValue placeholder="Todas" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas</SelectItem>
                  {schools.map((s) => (
                    <SelectItem key={s.id} value={String(s.id)}>{s.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <Label>Série</Label>
              <Input
                placeholder="Ex: 9A"
                value={serie}
                onChange={(e) => setSerie(e.target.value)}
                className="w-28"
              />
            </div>
            <Button type="submit">Filtrar</Button>
          </form>

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
                {ranking.length === 0
                  ? <tr><td colSpan={5} className="px-4 py-4 text-center text-slate-400">Sem dados.</td></tr>
                  : ranking.map((r, i) => (
                      <tr key={r.studentId} className="border-t border-slate-100 hover:bg-slate-50">
                        <td className="px-4 py-2 font-bold text-slate-500">{i + 1}</td>
                        <td className="px-4 py-2 font-medium">{r.studentName}</td>
                        <td className="px-4 py-2 text-slate-500">{r.schoolName}</td>
                        <td className="px-4 py-2 text-slate-500">{r.serie}</td>
                        <td className="px-4 py-2 text-right font-bold">{r.totalPoints}</td>
                      </tr>
                    ))
                }
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  )
}
