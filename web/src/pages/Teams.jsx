import { useEffect, useState } from 'react'
import { Pencil, Trash2, Check, X } from 'lucide-react'
import { api } from '@/api'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'

export default function Teams() {
  const [championships, setChampionships] = useState([])
  const [teams, setTeams] = useState([])
  const [championshipId, setChampionshipId] = useState('')
  const [name, setName] = useState('')
  const [editingId, setEditingId] = useState(null)
  const [editingName, setEditingName] = useState('')
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [error, setError] = useState('')

  useEffect(() => {
    api.getChampionships().then(setChampionships).catch((e) => setError(e.message))
  }, [])

  async function onChampionshipChange(val) {
    setChampionshipId(val)
    setError('')
    try {
      setTeams(await api.getTeams(val))
    } catch (e) {
      setError(e.message)
    }
  }

  async function handleCreate(e) {
    e.preventDefault()
    if (!name.trim()) return
    try {
      await api.createTeam(championshipId, name.trim())
      setName('')
      setTeams(await api.getTeams(championshipId))
    } catch (e) {
      setError(e.message)
    }
  }

  async function handleUpdate(teamId) {
    if (!editingName.trim()) return
    try {
      await api.updateTeam(championshipId, teamId, editingName.trim())
      setEditingId(null)
      setTeams(await api.getTeams(championshipId))
    } catch (e) {
      setError(e.message)
    }
  }

  async function handleDelete() {
    try {
      await api.deleteTeam(championshipId, deleteTarget.id)
      setDeleteTarget(null)
      setTeams(await api.getTeams(championshipId))
    } catch (e) {
      setError(e.message)
    }
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Times</h1>

      <div className="space-y-1 max-w-md">
        <Label>Campeonato</Label>
        <Select value={championshipId} onValueChange={onChampionshipChange}>
          <SelectTrigger><SelectValue placeholder="Selecione um campeonato" /></SelectTrigger>
          <SelectContent>
            {championships.map((c) => <SelectItem key={c.id} value={String(c.id)}>{c.name}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>

      {championshipId && (
        <form onSubmit={handleCreate} className="flex gap-2 max-w-md">
          <Input
            placeholder="Nome do time"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
          <Button type="submit">Adicionar</Button>
        </form>
      )}

      {error && <p className="text-sm text-red-600">{error}</p>}

      {championshipId && (
        <div className="space-y-2 max-w-md">
          {teams.length === 0 && <p className="text-slate-500 text-sm">Nenhum time cadastrado neste campeonato.</p>}
          {teams.map((t) => (
            <div key={t.id} className="flex items-center gap-3 rounded-lg border border-slate-200 bg-white px-4 py-3">
              {editingId === t.id ? (
                <>
                  <Input
                    className="flex-1 h-7 text-sm"
                    value={editingName}
                    onChange={(e) => setEditingName(e.target.value)}
                    autoFocus
                  />
                  <Button size="icon" variant="ghost" onClick={() => handleUpdate(t.id)}>
                    <Check className="h-4 w-4 text-green-600" />
                  </Button>
                  <Button size="icon" variant="ghost" onClick={() => setEditingId(null)}>
                    <X className="h-4 w-4 text-slate-400" />
                  </Button>
                </>
              ) : (
                <>
                  <span className="font-medium flex-1">{t.name}</span>
                  <Button size="icon" variant="ghost" onClick={() => { setEditingId(t.id); setEditingName(t.name) }}>
                    <Pencil className="h-4 w-4 text-slate-400" />
                  </Button>
                  <Button size="icon" variant="ghost" onClick={() => setDeleteTarget(t)}>
                    <Trash2 className="h-4 w-4 text-red-400" />
                  </Button>
                </>
              )}
            </div>
          ))}
        </div>
      )}

      <Dialog open={!!deleteTarget} onOpenChange={(open) => !open && setDeleteTarget(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Remover time</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-slate-600">
            Deseja remover o time <span className="font-semibold">{deleteTarget?.name}</span>? Esta ação não pode ser desfeita.
          </p>
          <div className="flex gap-3 mt-2">
            <Button variant="outline" className="flex-1" onClick={() => setDeleteTarget(null)}>Cancelar</Button>
            <Button variant="destructive" className="flex-1" onClick={handleDelete}>Remover</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
