import { useEffect, useState } from 'react'
import { Trash2 } from 'lucide-react'
import { api } from '@/api'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select'
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { ConfirmDeleteDialog } from '@/components/ConfirmDeleteDialog'
import { LayoutToggle } from '@/components/LayoutToggle'

export default function MatchesTab({ championshipId }) {
  const [matches, setMatches] = useState([])
  const [teams, setTeams] = useState([])
  const [title, setTitle] = useState('')
  const [teamHome, setTeamHome] = useState('')
  const [teamAway, setTeamAway] = useState('')
  const [error, setError] = useState('')
  const [resultMatch, setResultMatch] = useState(null)
  const [scoreHome, setScoreHome] = useState('')
  const [scoreAway, setScoreAway] = useState('')
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [loadingDelete, setLoadingDelete] = useState(false)
  const [grid, setGrid] = useState(false)

  async function load() {
    try {
      const [m, t] = await Promise.all([api.getMatches(championshipId), api.getTeams(championshipId)])
      setMatches(m)
      setTeams(t)
    } catch (e) {
      setError(e.message)
    }
  }

  useEffect(() => { load() }, [championshipId])

  async function handleCreate(e) {
    e.preventDefault()
    if (!teamHome || !teamAway) return
    try {
      await api.createMatch(championshipId, { title: title.trim(), teamHomeId: teamHome, teamAwayId: teamAway })
      setTitle(''); setTeamHome(''); setTeamAway('')
      load()
    } catch (e) {
      setError(e.message)
    }
  }

  async function handleResult(e) {
    e.preventDefault()
    try {
      await api.setResult(resultMatch.id, { scoreHome: Number(scoreHome), scoreAway: Number(scoreAway) })
      setResultMatch(null); setScoreHome(''); setScoreAway('')
      load()
    } catch (e) {
      setError(e.message)
    }
  }

  async function handleDelete() {
    setLoadingDelete(true)
    try {
      await api.deleteMatch(championshipId, deleteTarget.id)
      setDeleteTarget(null)
      load()
    } catch (e) {
      setError(e.message)
    } finally {
      setLoadingDelete(false)
    }
  }

  return (
    <div className="space-y-6">
      <form onSubmit={handleCreate} className="grid grid-cols-2 gap-3 max-w-md">
        <div className="space-y-1 col-span-2">
          <Label>Título</Label>
          <Input placeholder="Ex: Semifinal, Rodada 1..." value={title} onChange={(e) => setTitle(e.target.value)} required />
        </div>
        <div className="space-y-1">
          <Label>Time Casa</Label>
          <Select value={teamHome} onValueChange={setTeamHome}>
            <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
            <SelectContent>
              {teams.map((t) => <SelectItem key={t.id} value={String(t.id)}>{t.name}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1">
          <Label>Time Fora</Label>
          <Select value={teamAway} onValueChange={setTeamAway}>
            <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
            <SelectContent>
              {teams.map((t) => <SelectItem key={t.id} value={String(t.id)}>{t.name}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
        <Button type="submit" className="col-span-2">Adicionar Partida</Button>
      </form>

      {error && <p className="text-sm text-red-600">{error}</p>}

      <div className="flex items-center justify-between">
        <span className="text-sm text-slate-500">{matches.length} partida{matches.length !== 1 ? 's' : ''}</span>
        <LayoutToggle grid={grid} onToggle={() => setGrid((g) => !g)} />
      </div>

      <div className={grid ? 'grid grid-cols-2 gap-2' : 'space-y-2'}>
        {matches.length === 0 && <p className="text-slate-500 text-sm">Nenhuma partida cadastrada.</p>}
        {matches.map((m) => (
          <div key={m.id} className="flex items-center justify-between rounded-lg border border-slate-200 bg-white px-4 py-3">
            <div className="flex flex-col">
              {m.title && <span className="text-xs text-slate-400 font-medium uppercase tracking-wide">{m.title}</span>}
              <span className="font-medium">
                {m.teamHomeName} <span className="text-slate-400 mx-2">vs</span> {m.teamAwayName}
                {m.scoreHome != null && (
                  <span className="ml-3 text-slate-600 font-bold">{m.scoreHome} – {m.scoreAway}</span>
                )}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Dialog open={resultMatch?.id === m.id} onOpenChange={(open) => !open && setResultMatch(null)}>
                <DialogTrigger asChild>
                  <Button size="sm" variant="outline" onClick={() => setResultMatch(m)}>Resultado</Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader><DialogTitle>Registrar Resultado</DialogTitle></DialogHeader>
                  <p className="text-sm text-slate-600 mb-4">{m.teamHomeName} vs {m.teamAwayName}</p>
                  <form onSubmit={handleResult} className="space-y-4">
                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <Label>{m.teamHomeName}</Label>
                        <Input type="number" min="0" value={scoreHome} onChange={(e) => setScoreHome(e.target.value)} required />
                      </div>
                      <div className="space-y-1">
                        <Label>{m.teamAwayName}</Label>
                        <Input type="number" min="0" value={scoreAway} onChange={(e) => setScoreAway(e.target.value)} required />
                      </div>
                    </div>
                    <Button type="submit" className="w-full">Salvar</Button>
                  </form>
                </DialogContent>
              </Dialog>
              <Button size="icon" variant="ghost" onClick={() => setDeleteTarget(m)}>
                <Trash2 className="h-4 w-4 text-red-400" />
              </Button>
            </div>
          </div>
        ))}
      </div>

      <ConfirmDeleteDialog
        open={!!deleteTarget}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
        description={`Deseja excluir a partida "${deleteTarget?.title} — ${deleteTarget?.teamHomeName} vs ${deleteTarget?.teamAwayName}"? Todos os palpites feitos para esta partida serão removidos permanentemente.`}
        onConfirm={handleDelete}
        loading={loadingDelete}
      />
    </div>
  )
}
