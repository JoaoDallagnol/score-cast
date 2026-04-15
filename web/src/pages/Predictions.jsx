import { useEffect, useState } from 'react'
import { api } from '@/api'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select'

function PredictionCard({ item, onChange }) {
  return (
    <div className="rounded-lg border border-slate-200 bg-white px-4 py-4 space-y-3">
      <div>
        <p className="text-xs text-slate-400 font-medium uppercase tracking-wide">{item.title}</p>
        <p className="font-semibold text-slate-800">{item.teamHomeName} <span className="text-slate-400 font-normal">vs</span> {item.teamAwayName}</p>
        {item.scoreHome != null && (
          <p className="text-xs text-slate-500 mt-0.5">Resultado oficial: {item.scoreHome} – {item.scoreAway}</p>
        )}
      </div>
      <div className="flex items-center gap-3">
        <div className="space-y-1 flex-1">
          <Label className="text-xs">{item.teamHomeName}</Label>
          <Input
            type="number"
            min="0"
            placeholder="–"
            value={item.predHome ?? ''}
            onChange={(e) => onChange(item.matchId, 'predHome', e.target.value)}
          />
        </div>
        <span className="text-slate-400 mt-5">×</span>
        <div className="space-y-1 flex-1">
          <Label className="text-xs">{item.teamAwayName}</Label>
          <Input
            type="number"
            min="0"
            placeholder="–"
            value={item.predAway ?? ''}
            onChange={(e) => onChange(item.matchId, 'predAway', e.target.value)}
          />
        </div>
        {item.pointsAwarded != null && (
          <div className="mt-5 text-right shrink-0">
            <span className="text-xs text-slate-400">Pontos</span>
            <p className="font-bold text-slate-700">{item.pointsAwarded}</p>
          </div>
        )}
      </div>
    </div>
  )
}

export default function Predictions() {
  const [championships, setChampionships] = useState([])
  const [students, setStudents] = useState([])
  const [cards, setCards] = useState([])
  const [championshipId, setChampionshipId] = useState('')
  const [studentId, setStudentId] = useState('')
  const [saving, setSaving] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    api.getChampionships().then(setChampionships).catch((e) => setError(e.message))
  }, [])

  async function onChampionshipChange(val) {
    setChampionshipId(val)
    setStudentId('')
    setCards([])
    setStudents([])
    setSuccess(false)
    setError('')
    try {
      setStudents(await api.getStudents(val))
    } catch (e) {
      setError(e.message)
    }
  }

  async function onStudentChange(val) {
    setStudentId(val)
    setCards([])
    setSuccess(false)
    setError('')
    try {
      const data = await api.getPredictions(val, championshipId)
      setCards(data)
    } catch (e) {
      setError(e.message)
    }
  }

  function handleChange(matchId, field, value) {
    setCards((prev) =>
      prev.map((c) =>
        c.matchId === matchId
          ? { ...c, [field]: value === '' ? null : Number(value) }
          : c
      )
    )
  }

  async function handleSave() {
    setSaving(true)
    setSuccess(false)
    setError('')
    try {
      const payload = cards.map((c) => ({
        matchId: c.matchId,
        predHome: c.predHome,
        predAway: c.predAway,
      }))
      const updated = await api.savePredictionsBatch(studentId, payload)
      // merge pontos atualizados de volta nos cards
      setCards((prev) =>
        prev.map((c) => {
          const saved = updated.find((u) => u.matchId === c.matchId)
          return saved ? { ...c, pointsAwarded: saved.pointsAwarded } : c
        })
      )
      setSuccess(true)
    } catch (e) {
      setError(e.message)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="space-y-6 max-w-xl">
      <h1 className="text-2xl font-bold">Palpites</h1>

      <div className="grid grid-cols-2 gap-3">
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
          <Select value={studentId} onValueChange={onStudentChange} disabled={!championshipId}>
            <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
            <SelectContent>
              {students.map((s) => (
                <SelectItem key={s.id} value={String(s.id)}>
                  <span>{s.name}</span>
                  {s.schoolName && <span className="ml-2 text-slate-400 text-xs">{s.schoolName}</span>}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}

      {cards.length > 0 && (
        <>
          <div className="space-y-3">
            {cards.map((item) => (
              <PredictionCard key={item.matchId} item={item} onChange={handleChange} />
            ))}
          </div>

          <div className="flex items-center gap-4">
            <Button onClick={handleSave} loading={saving} className="w-full">
              {saving ? 'Salvando...' : 'Atualizar Palpites'}
            </Button>
          </div>

          {success && (
            <p className="text-sm text-green-600 text-center">Palpites salvos com sucesso!</p>
          )}
        </>
      )}

      {studentId && cards.length === 0 && !error && (
        <p className="text-slate-500 text-sm">Nenhuma partida encontrada neste campeonato.</p>
      )}
    </div>
  )
}
