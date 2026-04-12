import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Trophy, ChevronRight, Pencil, Trash2, Check, X } from 'lucide-react'
import { api } from '@/api'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ConfirmDeleteDialog } from '@/components/ConfirmDeleteDialog'

export default function Championships() {
  const [championships, setChampionships] = useState([])
  const [name, setName] = useState('')
  const [editingId, setEditingId] = useState(null)
  const [editingName, setEditingName] = useState('')
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const navigate = useNavigate()

  async function load() {
    try {
      setChampionships(await api.getChampionships())
    } catch (e) {
      setError(e.message)
    }
  }

  useEffect(() => { load() }, [])

  async function handleCreate(e) {
    e.preventDefault()
    if (!name.trim()) return
    try {
      await api.createChampionship(name.trim())
      setName('')
      load()
    } catch (e) {
      setError(e.message)
    }
  }

  async function handleUpdate(id) {
    if (!editingName.trim()) return
    try {
      await api.updateChampionship(id, editingName.trim())
      setEditingId(null)
      load()
    } catch (e) {
      setError(e.message)
    }
  }

  async function handleDelete() {
    setLoading(true)
    try {
      await api.deleteChampionship(deleteTarget.id)
      setDeleteTarget(null)
      load()
    } catch (e) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Campeonatos</h1>

      <form onSubmit={handleCreate} className="flex gap-2 max-w-md">
        <Input placeholder="Nome do campeonato" value={name} onChange={(e) => setName(e.target.value)} />
        <Button type="submit">Criar</Button>
      </form>

      {error && <p className="text-sm text-red-600">{error}</p>}

      <div className="space-y-2">
        {championships.length === 0 && <p className="text-slate-500 text-sm">Nenhum campeonato cadastrado.</p>}
        {championships.map((c) => (
          <div key={c.id} className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-3">
            {editingId === c.id ? (
              <>
                <Input
                  className="flex-1 h-7 text-sm"
                  value={editingName}
                  onChange={(e) => setEditingName(e.target.value)}
                  autoFocus
                />
                <Button size="icon" variant="ghost" onClick={() => handleUpdate(c.id)}>
                  <Check className="h-4 w-4 text-green-600" />
                </Button>
                <Button size="icon" variant="ghost" onClick={() => setEditingId(null)}>
                  <X className="h-4 w-4 text-slate-400" />
                </Button>
              </>
            ) : (
              <>
                <Trophy className="h-5 w-5 text-slate-400 shrink-0" />
                <span
                  className="font-medium flex-1 cursor-pointer hover:text-slate-600"
                  onClick={() => navigate(`/championships/${c.id}`)}
                >
                  {c.name}
                </span>
                <Button size="icon" variant="ghost" onClick={() => { setEditingId(c.id); setEditingName(c.name) }}>
                  <Pencil className="h-4 w-4 text-slate-400" />
                </Button>
                <Button size="icon" variant="ghost" onClick={() => setDeleteTarget(c)}>
                  <Trash2 className="h-4 w-4 text-red-400" />
                </Button>
                <Button size="icon" variant="ghost" onClick={() => navigate(`/championships/${c.id}`)}>
                  <ChevronRight className="h-4 w-4 text-slate-400" />
                </Button>
              </>
            )}
          </div>
        ))}
      </div>

      <ConfirmDeleteDialog
        open={!!deleteTarget}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
        description={`Deseja excluir o campeonato "${deleteTarget?.name}"? Todos os dados vinculados (partidas, alunos, palpites e ranking) serão removidos permanentemente.`}
        onConfirm={handleDelete}
        loading={loading}
      />
    </div>
  )
}
