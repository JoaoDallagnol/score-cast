import { useEffect, useState } from 'react'
import { api } from '@/api'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select'

export default function Predictions() {
  const [championships, setChampionships] = useState([])
  const [students, setStudents] = useState([])
  const [matches, setMatches] = useState([])
  const [championshipId, setChampionshipId] = useState('')
  const [studentId, setStudentId] = useState('')
  const [matchId, setMatchId] = useState('')
  const [predHome, setPredHome] = useState('')
  const [predAway, setPredAway] = useState('')
  const [saved, setSaved] = useState(null)
  const [error, setError] = useState('')

  useEffect(() => {
    api.getChampionships().then(setChampionships).catch((e) => setError(e.message))
  }, [])

  async function onChampionshipChange(val) {
    setChampionshipId(val)
    setStudentId('')
    setMatchId('')
    setSaved(null)
    try {
      const [s, m] = await Promise.all([api.getStudents(val), api.getMatches(val)])
      setStudents(s)
      setMatches(m)
    } catch (e) {
      setError(e.message)
    }
  }

  async function handleSave(e) {
    e.preventDefault()
    if (!studentId || !matchId) return
    try {
      const result = await api.savePrediction(studentId, matchId, {
        predHome: Number(predHome),
        predAway: Number(predAway),
      })
      setSaved(result)
      setError('')
    } catch (e) {
      setError(e.message)
    }
  }

  const selectedMatch = matches.find((m) => String(m.id) === matchId)

  return (
    <div className="space-y-6 max-w-md">
      <h1 className="text-2xl font-bold">Palpites</h1>

      <form onSubmit={handleSave} className="space-y-4">
        <div className="space-y-1">
          <Label>Campeonato</Label>
          <Select value={championshipId} onValueChange={onChampionshipChange}>
            <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
            <SelectContent>
              {championships.map((c) => <SelectItem key={c.id} value={String(c.id)}>{c.name}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-1">
          <Label>Aluno</Label>
          <Select value={studentId} onValueChange={setStudentId} disabled={!championshipId}>
            <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
            <SelectContent>
              {students.map((s) => <SelectItem key={s.id} value={String(s.id)}>{s.name}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-1">
          <Label>Partida</Label>
          <Select value={matchId} onValueChange={setMatchId} disabled={!championshipId}>
            <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
            <SelectContent>
              {matches.map((m) => (
                <SelectItem key={m.id} value={String(m.id)}>
                  {m.title} — {m.teamHome} vs {m.teamAway}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {matchId && (
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label>{selectedMatch?.teamHome ?? 'Casa'}</Label>
              <Input type="number" min="0" value={predHome} onChange={(e) => setPredHome(e.target.value)} required />
            </div>
            <div className="space-y-1">
              <Label>{selectedMatch?.teamAway ?? 'Fora'}</Label>
              <Input type="number" min="0" value={predAway} onChange={(e) => setPredAway(e.target.value)} required />
            </div>
          </div>
        )}

        <Button type="submit" className="w-full" disabled={!studentId || !matchId}>
          Salvar Palpite
        </Button>
      </form>

      {error && <p className="text-sm text-red-600">{error}</p>}

      {saved && (
        <div className="rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-800">
          Palpite salvo!
          {saved.points != null && <span className="ml-2 font-bold">{saved.points} pontos</span>}
        </div>
      )}
    </div>
  )
}
