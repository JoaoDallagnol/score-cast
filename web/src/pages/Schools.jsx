import { useEffect, useState } from 'react'
import { School, Pencil, Trash2, Check, X } from 'lucide-react'
import { api } from '@/api'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ConfirmDeleteDialog } from '@/components/ConfirmDeleteDialog'
import { LayoutToggle } from '@/components/LayoutToggle'

export default function Schools() {
  const [schools, setSchools] = useState([])
  const [name, setName] = useState('')
  const [editingId, setEditingId] = useState(null)
  const [editingName, setEditingName] = useState('')
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [deleteError, setDeleteError] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [grid, setGrid] = useState(false)

  async function load() {
    try { setSchools(await api.getSchools()) } catch (e) { setError(e.message) }
  }

  useEffect(() => { load() }, [])

  async function handleCreate(e) {
    e.preventDefault()
    if (!name.trim()) return
    setLoading(true)
    try { await api.createSchool(name.trim()); setName(''); load() } catch (e) { setError(e.message) }
    finally { setLoading(false) }
  }

  async function handleUpdate(id) {
    if (!editingName.trim()) return
    try { await api.updateSchool(id, editingName.trim()); setEditingId(null); load() } catch (e) { setError(e.message) }
  }

  async function handleDelete() {
    setLoading(true); setDeleteError('')
    try { await api.deleteSchool(deleteTarget.id); setDeleteTarget(null); load() }
    catch { setDeleteError('Não é possível excluir esta escola pois existem alunos vinculados a ela. Remova os alunos primeiro.') }
    finally { setLoading(false) }
  }

  function Item({ s }) {
    if (editingId === s.id) return (
      <div className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-3">
        <Input className="flex-1 h-7 text-sm" value={editingName} onChange={(e) => setEditingName(e.target.value)} autoFocus />
        <Button size="icon" variant="ghost" onClick={() => handleUpdate(s.id)}><Check className="h-4 w-4 text-green-600" /></Button>
        <Button size="icon" variant="ghost" onClick={() => setEditingId(null)}><X className="h-4 w-4 text-slate-400" /></Button>
      </div>
    )
    return (
      <div className="flex items-center gap-3 rounded-lg border border-slate-200 bg-white px-4 py-3">
        <School className="h-5 w-5 text-slate-400 shrink-0" />
        <span className="font-medium flex-1">{s.name}</span>
        <Button size="icon" variant="ghost" onClick={() => { setEditingId(s.id); setEditingName(s.name) }}><Pencil className="h-4 w-4 text-slate-400" /></Button>
        <Button size="icon" variant="ghost" onClick={() => { setDeleteTarget(s); setDeleteError('') }}><Trash2 className="h-4 w-4 text-red-400" /></Button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Escolas</h1>
      <form onSubmit={handleCreate} className="flex gap-2 max-w-md">
        <Input placeholder="Nome da escola" value={name} onChange={(e) => setName(e.target.value)} />
        <Button type="submit" loading={loading}>Criar</Button>
      </form>
      {error && <p className="text-sm text-red-600">{error}</p>}
      <div className="flex items-center justify-between">
        <span className="text-sm text-slate-500">{schools.length} escola{schools.length !== 1 ? 's' : ''}</span>
        <LayoutToggle grid={grid} onToggle={() => setGrid((g) => !g)} />
      </div>
      {schools.length === 0
        ? <p className="text-slate-500 text-sm">Nenhuma escola cadastrada.</p>
        : <div className={grid ? 'grid grid-cols-2 gap-2' : 'space-y-2'}>
            {schools.map((s) => <Item key={s.id} s={s} />)}
          </div>
      }
      <ConfirmDeleteDialog
        open={!!deleteTarget}
        onOpenChange={(open) => { if (!open) { setDeleteTarget(null); setDeleteError('') } }}
        description={deleteError || `Deseja excluir a escola "${deleteTarget?.name}"? Esta ação não pode ser desfeita.`}
        onConfirm={handleDelete}
        loading={loading}
      />
    </div>
  )
}
