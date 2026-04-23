import { useEffect, useState } from 'react'
import { ArrowUp, ArrowDown } from 'lucide-react'
import { api } from '@/api'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select'

function PredictionCard({ item, onChange }) {
  return (
    <div className="rounded-lg border border-slate-200 bg-white p-3">
      <div className="flex items-center justify-between gap-4">
        <div className="flex-1">
          <p className="text-xs text-slate-400 font-medium uppercase tracking-wide">{item.title}</p>
          <p className="font-semibold text-slate-800 text-sm">{item.teamHomeName} vs {item.teamAwayName}</p>
          {item.scoreHome != null && (
            <p className="text-xs text-slate-500 mt-1">Resultado: {item.scoreHome}–{item.scoreAway}</p>
          )}
        </div>
        <div className="flex items-center gap-1 shrink-0">
          <Input
            type="number"
            min="0"
            placeholder="–"
            value={item.predHome ?? ''}
            onChange={(e) => onChange(item.matchId, 'predHome', e.target.value)}
            className="w-12 h-8 text-center text-sm p-1"
          />
          <span className="text-slate-400 font-bold text-sm">×</span>
          <Input
            type="number"
            min="0"
            placeholder="–"
            value={item.predAway ?? ''}
            onChange={(e) => onChange(item.matchId, 'predAway', e.target.value)}
            className="w-12 h-8 text-center text-sm p-1"
          />
          {item.pointsAwarded != null && (
            <div className="text-center ml-2 min-w-fit">
              <p className="text-xs text-slate-400">Pts</p>
              <p className="font-bold text-slate-700 text-sm">{item.pointsAwarded}</p>
            </div>
          )}
        </div>
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
  const [sort, setSort] = useState('desc')

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

  async function loadPredictions() {
    if (!studentId || !championshipId) return
    try {
      const data = await api.getPredictions(studentId, championshipId, sort)
      setCards(data)
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
      const data = await api.getPredictions(val, championshipId, sort)
      setCards(data)
    } catch (e) {
      setError(e.message)
    }
  }

  useEffect(() => {
    if (studentId && championshipId) {
      loadPredictions()
    }
  }, [sort])

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
    <div className="space-y-6 max-w-2xl">
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
          <div className="flex items-center justify-between gap-4">
            <span className="text-sm text-slate-500">{cards.length} partida{cards.length !== 1 ? 's' : ''}</span>
            <button
              onClick={() => setSort(sort === 'asc' ? 'desc' : 'asc')}
              className="flex items-center justify-center w-10 h-10 rounded border-2 border-slate-300 bg-white hover:bg-slate-50 active:bg-slate-100 transition-colors cursor-pointer"
              title={sort === 'asc' ? 'Ordenar decrescente' : 'Ordenar crescente'}
              type="button"
            >
              {sort === 'asc' ? <ArrowUp size={18} className="text-slate-600" /> : <ArrowDown size={18} className="text-slate-600" />}
            </button>
          </div>
          <div className="space-y-2">
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
