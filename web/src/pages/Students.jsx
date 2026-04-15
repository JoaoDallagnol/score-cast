import { useEffect, useState } from 'react'
import { GraduationCap, Pencil, Trash2, Check, X } from 'lucide-react'
import { api } from '@/api'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select'
import { ConfirmDeleteDialog } from '@/components/ConfirmDeleteDialog'
import { LayoutToggle } from '@/components/LayoutToggle'

export default function Students() {
  const [championships, setChampionships] = useState([])
  const [schools, setSchools] = useState([])
  const [students, setStudents] = useState([])
  const [championshipId, setChampionshipId] = useState('')
  const [filterSchoolId, setFilterSchoolId] = useState('')
  const [name, setName] = useState('')
  const [serie, setSerie] = useState('')
  const [schoolId, setSchoolId] = useState('')
  const [editingId, setEditingId] = useState(null)
  const [editingData, setEditingData] = useState({})
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [loading, setLoading] = useState(false)
  const [loadingCreate, setLoadingCreate] = useState(false)
  const [error, setError] = useState('')
  const [grid, setGrid] = useState(false)

  useEffect(() => {
    Promise.all([api.getChampionships(), api.getSchools()])
      .then(([c, s]) => { setChampionships(c); setSchools(s) })
      .catch((e) => setError(e.message))
  }, [])

  async function loadStudents(params) {
    try { setStudents(await api.getStudents(championshipId, params)) } catch (e) { setError(e.message) }
  }

  async function onChampionshipChange(val) {
    setChampionshipId(val); setStudents([]); setEditingId(null); setError(''); setFilterSchoolId('')
    try { setStudents(await api.getStudents(val, {})) } catch (e) { setError(e.message) }
  }

  async function handleCreate(e) {
    e.preventDefault()
    if (!name.trim() || !serie.trim() || !schoolId) return
    setError('')
    setLoadingCreate(true)
    try {
      await api.createStudent(championshipId, { name: name.trim(), serie: serie.trim(), schoolId })
      setName(''); setSerie(''); setSchoolId('')
    } catch (e) { setError(e.message); return }
    finally { setLoadingCreate(false) }
    await loadStudents({ schoolId: filterSchoolId || undefined })
  }

  async function handleUpdate(studentId) {
    if (!editingData.name?.trim() || !editingData.serie?.trim() || !editingData.schoolId) return
    try {
      await api.updateStudent(championshipId, studentId, { name: editingData.name.trim(), serie: editingData.serie.trim(), schoolId: editingData.schoolId })
      setEditingId(null)
      await loadStudents({ schoolId: filterSchoolId || undefined })
    } catch (e) { setError(e.message) }
  }

  async function handleDelete() {
    setLoading(true)
    try {
      await api.deleteStudent(championshipId, deleteTarget.id)
      setDeleteTarget(null)
      await loadStudents({ schoolId: filterSchoolId || undefined })
    } catch (e) { setError(e.message) }
    finally { setLoading(false) }
  }

  const schoolName = (id) => schools.find((s) => String(s.id) === String(id))?.name ?? ''

  function Item({ s }) {
    if (editingId === s.id) return (
      <div className="rounded-lg border border-slate-200 bg-white px-4 py-3">
        <div className="grid grid-cols-2 gap-2">
          <Input className="col-span-2 h-7 text-sm" value={editingData.name} onChange={(e) => setEditingData((p) => ({ ...p, name: e.target.value }))} placeholder="Nome" autoFocus />
          <Input className="h-7 text-sm" value={editingData.serie} onChange={(e) => setEditingData((p) => ({ ...p, serie: e.target.value }))} placeholder="Série" />
          <Select value={editingData.schoolId} onValueChange={(v) => setEditingData((p) => ({ ...p, schoolId: v }))}>
            <SelectTrigger className="h-7 text-sm"><SelectValue placeholder="Escola" /></SelectTrigger>
            <SelectContent>{schools.map((sc) => <SelectItem key={sc.id} value={String(sc.id)}>{sc.name}</SelectItem>)}</SelectContent>
          </Select>
          <div className="col-span-2 flex gap-2 justify-end">
            <Button size="icon" variant="ghost" onClick={() => handleUpdate(s.id)}><Check className="h-4 w-4 text-green-600" /></Button>
            <Button size="icon" variant="ghost" onClick={() => setEditingId(null)}><X className="h-4 w-4 text-slate-400" /></Button>
          </div>
        </div>
      </div>
    )
    return (
      <div className="flex items-center gap-3 rounded-lg border border-slate-200 bg-white px-4 py-3">
        <GraduationCap className="h-5 w-5 text-slate-400 shrink-0" />
        <span className="font-medium flex-1">{s.name}</span>
        <span className="text-sm text-slate-500">{s.serie}</span>
        <span className="text-sm text-slate-500">{s.schoolName ?? schoolName(s.schoolId)}</span>
        <Button size="icon" variant="ghost" onClick={() => { setEditingId(s.id); setEditingData({ name: s.name, serie: s.serie, schoolId: String(s.schoolId) }) }}><Pencil className="h-4 w-4 text-slate-400" /></Button>
        <Button size="icon" variant="ghost" onClick={() => setDeleteTarget(s)}><Trash2 className="h-4 w-4 text-red-400" /></Button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Alunos</h1>
      <div className="space-y-1 max-w-md">
        <Label>Campeonato</Label>
        <Select value={championshipId} onValueChange={onChampionshipChange}>
          <SelectTrigger><SelectValue placeholder="Selecione um campeonato" /></SelectTrigger>
          <SelectContent>{championships.map((c) => <SelectItem key={c.id} value={String(c.id)}>{c.name}</SelectItem>)}</SelectContent>
        </Select>
      </div>
      {championshipId && (
        <form onSubmit={handleCreate} className="grid grid-cols-2 gap-3 max-w-md">
          <div className="space-y-1 col-span-2">
            <Label>Nome</Label>
            <Input placeholder="Nome do aluno" value={name} onChange={(e) => setName(e.target.value)} required />
          </div>
          <div className="space-y-1">
            <Label>Série</Label>
            <Input placeholder="Ex: 9A" value={serie} onChange={(e) => setSerie(e.target.value)} required />
          </div>
          <div className="space-y-1">
            <Label>Escola</Label>
            <Select value={schoolId} onValueChange={setSchoolId}>
              <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
              <SelectContent>{schools.map((s) => <SelectItem key={s.id} value={String(s.id)}>{s.name}</SelectItem>)}</SelectContent>
            </Select>
          </div>
          <Button type="submit" className="col-span-2" loading={loadingCreate}>Cadastrar Aluno</Button>
        </form>
      )}
      {error && <p className="text-sm text-red-600">{error}</p>}
      {championshipId && (
        <>
          <div className="space-y-1 max-w-md">
            <Label>Filtrar por escola</Label>
            <Select value={filterSchoolId || 'all'} onValueChange={(v) => {
              const val = v === 'all' ? '' : v
              setFilterSchoolId(val)
              loadStudents({ schoolId: val || undefined })
            }}>
              <SelectTrigger><SelectValue placeholder="Todas" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas</SelectItem>
                {schools.map((s) => <SelectItem key={s.id} value={String(s.id)}>{s.name}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-slate-500">{students.length} aluno{students.length !== 1 ? 's' : ''}</span>
            <LayoutToggle grid={grid} onToggle={() => setGrid((g) => !g)} />
          </div>
          {students.length === 0
            ? <p className="text-slate-500 text-sm">Nenhum aluno cadastrado neste campeonato.</p>
            : <div className={grid ? 'grid grid-cols-2 gap-2' : 'space-y-2'}>
                {students.map((s) => <Item key={s.id} s={s} />)}
              </div>
          }
        </>
      )}
      <ConfirmDeleteDialog
        open={!!deleteTarget}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
        description={`Deseja excluir o aluno "${deleteTarget?.name}"? Todos os palpites feitos por ele serão removidos permanentemente.`}
        onConfirm={handleDelete}
        loading={loading}
      />
    </div>
  )
}
