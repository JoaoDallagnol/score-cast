import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, Trophy, Shield, GraduationCap, School, Target, BarChart2, Settings, Trash2, Pencil, LayoutList, LayoutGrid } from 'lucide-react'
import { api } from '@/api'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { ConfirmDeleteDialog } from '@/components/ConfirmDeleteDialog'

const tabs = [
  { value: 'teams', label: 'Times', icon: Shield },
  { value: 'students', label: 'Alunos', icon: GraduationCap },
  { value: 'schools', label: 'Escolas', icon: School },
  { value: 'matches', label: 'Partidas', icon: Target },
  { value: 'predictions', label: 'Palpites', icon: Target },
  { value: 'ranking', label: 'Ranking', icon: BarChart2 },
]

export default function ChampionshipLayout() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [championship, setChampionship] = useState(null)
  const [error, setError] = useState('')
  const [activeTab, setActiveTab] = useState('teams')
  const [settingsOpen, setSettingsOpen] = useState(false)
  const [loadingBackup, setLoadingBackup] = useState(false)
  const [loadingClear, setLoadingClear] = useState(false)

  useEffect(() => {
    api.getChampionship(id).then(setChampionship).catch((e) => setError(e.message))
  }, [id])

  async function handleBackup() {
    setLoadingBackup(true)
    try {
      await api.backup()
      alert('Backup realizado com sucesso!')
    } catch (e) {
      alert('Erro ao fazer backup: ' + e.message)
    } finally {
      setLoadingBackup(false)
    }
  }

  async function handleClear() {
    if (!confirm('Tem certeza que deseja limpar todos os dados? Esta ação não pode ser desfeita.')) return
    setLoadingClear(true)
    try {
      await api.clearAll()
      alert('Dados limpos com sucesso!')
      navigate('/')
    } catch (e) {
      alert('Erro ao limpar dados: ' + e.message)
    } finally {
      setLoadingClear(false)
    }
  }

  if (error) return <p className="text-red-600">{error}</p>
  if (!championship) return <p className="text-slate-400">Carregando...</p>

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => navigate('/')}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <Trophy className="h-6 w-6 text-amber-500" />
          <h1 className="text-2xl font-bold">{championship.name}</h1>
        </div>

        <Dialog open={settingsOpen} onOpenChange={setSettingsOpen}>
          <DialogTrigger asChild>
            <Button variant="ghost" size="icon">
              <Settings className="h-5 w-5" />
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Configurações</DialogTitle>
              <DialogDescription>Ações globais do sistema</DialogDescription>
            </DialogHeader>
            <div className="space-y-3 pt-4">
              <Button variant="outline" className="w-full" onClick={handleBackup} loading={loadingBackup}>
                Fazer Backup do Banco
              </Button>
              <Button variant="destructive" className="w-full" onClick={handleClear} loading={loadingClear}>
                Limpar Todos os Dados
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="flex flex-wrap h-auto gap-1">
          {tabs.map(({ value, label, icon: Icon }) => (
            <TabsTrigger key={value} value={value} className="flex items-center gap-2">
              <Icon className="h-4 w-4" />
              {label}
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>

      {/* Content based on active tab */}
      <TabContent championshipId={id} activeTab={activeTab} />
    </div>
  )
}

function TabContent({ championshipId, activeTab }) {
  switch (activeTab) {
    case 'teams':
      return <TeamsContent championshipId={championshipId} />
    case 'students':
      return <StudentsContent championshipId={championshipId} />
    case 'schools':
      return <SchoolsContent />
    case 'matches':
      return <MatchesContent championshipId={championshipId} />
    case 'predictions':
      return <PredictionsContent championshipId={championshipId} />
    case 'ranking':
      return <RankingContent championshipId={championshipId} />
    default:
      return null
  }
}

// Times Content
function TeamsContent({ championshipId }) {
  const [teams, setTeams] = useState([])
  const [name, setName] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [editTarget, setEditTarget] = useState(null)
  const [editName, setEditName] = useState('')
  const [loadingEdit, setLoadingEdit] = useState(false)
  const [grid, setGrid] = useState(false)

  async function load() {
    try {
      const t = await api.getTeams(championshipId)
      setTeams(t)
    } catch (e) {
      setError(e.message)
    }
  }

  useEffect(() => { load() }, [championshipId])

  async function handleCreate(e) {
    e.preventDefault()
    if (!name.trim()) return
    setLoading(true)
    try {
      await api.createTeam(championshipId, name.trim())
      setName('')
      load()
    } catch (e) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }

  async function handleEdit(e) {
    e.preventDefault()
    if (!editName.trim()) return
    setLoadingEdit(true)
    try {
      await api.updateTeam(championshipId, editTarget.id, editName.trim())
      setEditTarget(null)
      setEditName('')
      load()
    } catch (e) {
      setError(e.message)
    } finally {
      setLoadingEdit(false)
    }
  }

  async function handleDelete() {
    try {
      await api.deleteTeam(championshipId, deleteTarget.id)
      setDeleteTarget(null)
      load()
    } catch (e) {
      setError(e.message)
    }
  }

  return (
    <div className="space-y-6">
      <form onSubmit={handleCreate} className="flex gap-3 max-w-md">
        <Input placeholder="Nome do time" value={name} onChange={(e) => setName(e.target.value)} required />
        <Button type="submit" loading={loading}>Adicionar</Button>
      </form>
      {error && <p className="text-sm text-red-600">{error}</p>}
      
      <div className="flex items-center justify-between">
        <span className="text-sm text-slate-500">{teams.length} time{teams.length !== 1 ? 's' : ''}</span>
        <Button size="icon" variant="outline" onClick={() => setGrid((g) => !g)} title={grid ? 'Visualização em lista' : 'Visualização em grade'}>
          {grid ? <LayoutList className="h-4 w-4" /> : <LayoutGrid className="h-4 w-4" />}
        </Button>
      </div>

      <div className={grid ? 'grid grid-cols-2 gap-2' : 'space-y-2 max-w-md'}>
        {teams.length === 0 && <p className="text-slate-500 text-sm">Nenhum time cadastrado.</p>}
        {teams.map((t) => (
          <div key={t.id} className="flex items-center justify-between rounded-lg border border-slate-200 bg-white px-4 py-2">
            <span className="font-medium">{t.name}</span>
            <div className="flex items-center gap-1">
              <Button size="sm" variant="ghost" onClick={() => { setEditTarget(t); setEditName(t.name) }}>
                <Pencil className="h-4 w-4" />
              </Button>
              <Button size="sm" variant="ghost" onClick={() => setDeleteTarget(t)}>
                <Trash2 className="h-4 w-4 text-red-400" />
              </Button>
            </div>
          </div>
        ))}
      </div>

      <ConfirmDeleteDialog
        open={!!deleteTarget}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
        description={`Deseja excluir o time "${deleteTarget?.name}"?`}
        onConfirm={handleDelete}
      />

      <Dialog open={!!editTarget} onOpenChange={(open) => !open && setEditTarget(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar Time</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleEdit} className="space-y-4">
            <Input value={editName} onChange={(e) => setEditName(e.target.value)} placeholder="Nome do time" required />
            <Button type="submit" className="w-full" loading={loadingEdit}>Salvar</Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}

// Students Content
function StudentsContent({ championshipId }) {
  const [students, setStudents] = useState([])
  const [schools, setSchools] = useState([])
  const [name, setName] = useState('')
  const [schoolId, setSchoolId] = useState('')
  const [serie, setSerie] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [editTarget, setEditTarget] = useState(null)
  const [editName, setEditName] = useState('')
  const [editSchoolId, setEditSchoolId] = useState('')
  const [editSerie, setEditSerie] = useState('')
  const [loadingEdit, setLoadingEdit] = useState(false)
  const [grid, setGrid] = useState(false)

  async function load() {
    try {
      const [s, sc] = await Promise.all([
        api.getStudents(championshipId),
        api.getSchools(),
      ])
      setStudents(s)
      setSchools(sc)
    } catch (e) {
      setError(e.message)
    }
  }

  useEffect(() => { load() }, [championshipId])

  async function handleCreate(e) {
    e.preventDefault()
    if (!name.trim() || !schoolId || !serie.trim()) return
    setLoading(true)
    try {
      await api.createStudent(championshipId, { name: name.trim(), schoolId, serie: serie.trim() })
      setName(''); setSchoolId(''); setSerie('')
      load()
    } catch (e) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }

  async function handleEdit(e) {
    e.preventDefault()
    if (!editName.trim() || !editSchoolId || !editSerie.trim()) return
    setLoadingEdit(true)
    try {
      await api.updateStudent(championshipId, editTarget.id, { name: editName.trim(), schoolId: editSchoolId, serie: editSerie.trim() })
      setEditTarget(null)
      load()
    } catch (e) {
      setError(e.message)
    } finally {
      setLoadingEdit(false)
    }
  }

  async function handleDelete() {
    try {
      await api.deleteStudent(championshipId, deleteTarget.id)
      setDeleteTarget(null)
      load()
    } catch (e) {
      setError(e.message)
    }
  }

  return (
    <div className="space-y-6">
      <form onSubmit={handleCreate} className="grid grid-cols-4 gap-3 max-w-2xl">
        <Input placeholder="Nome do aluno" value={name} onChange={(e) => setName(e.target.value)} required className="col-span-2" />
        <Select value={schoolId} onValueChange={setSchoolId}>
          <SelectTrigger><SelectValue placeholder="Escola" /></SelectTrigger>
          <SelectContent>
            {schools.map((s) => <SelectItem key={s.id} value={String(s.id)}>{s.name}</SelectItem>)}
          </SelectContent>
        </Select>
        <Input placeholder="Série" value={serie} onChange={(e) => setSerie(e.target.value)} required />
        <Button type="submit" loading={loading} className="col-span-4">Adicionar Aluno</Button>
      </form>
      {error && <p className="text-sm text-red-600">{error}</p>}

      <div className="flex items-center justify-between">
        <span className="text-sm text-slate-500">{students.length} aluno{students.length !== 1 ? 's' : ''}</span>
        <Button size="icon" variant="outline" onClick={() => setGrid((g) => !g)} title={grid ? 'Visualização em lista' : 'Visualização em grade'}>
          {grid ? <LayoutList className="h-4 w-4" /> : <LayoutGrid className="h-4 w-4" />}
        </Button>
      </div>

      <div className={grid ? 'grid grid-cols-2 gap-2' : 'space-y-2 max-w-2xl'}>
        {students.length === 0 && <p className="text-slate-500 text-sm">Nenhum aluno cadastrado.</p>}
        {students.map((s) => (
          <div key={s.id} className="flex items-center justify-between rounded-lg border border-slate-200 bg-white px-4 py-2">
            <div>
              <span className="font-medium">{s.name}</span>
              <span className="text-slate-400 text-sm ml-2">• {s.schoolName} • {s.serie}</span>
            </div>
            <div className="flex items-center gap-1">
              <Button size="sm" variant="ghost" onClick={() => { setEditTarget(s); setEditName(s.name); setEditSchoolId(String(s.schoolId)); setEditSerie(s.serie) }}>
                <Pencil className="h-4 w-4" />
              </Button>
              <Button size="sm" variant="ghost" onClick={() => setDeleteTarget(s)}>
                <Trash2 className="h-4 w-4 text-red-400" />
              </Button>
            </div>
          </div>
        ))}
      </div>

      <ConfirmDeleteDialog
        open={!!deleteTarget}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
        description={`Deseja excluir o aluno "${deleteTarget?.name}"?`}
        onConfirm={handleDelete}
      />

      <Dialog open={!!editTarget} onOpenChange={(open) => !open && setEditTarget(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar Aluno</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleEdit} className="space-y-4">
            <Input value={editName} onChange={(e) => setEditName(e.target.value)} placeholder="Nome" required />
            <Select value={editSchoolId} onValueChange={setEditSchoolId}>
              <SelectTrigger><SelectValue placeholder="Escola" /></SelectTrigger>
              <SelectContent>
                {schools.map((s) => <SelectItem key={s.id} value={String(s.id)}>{s.name}</SelectItem>)}
              </SelectContent>
            </Select>
            <Input value={editSerie} onChange={(e) => setEditSerie(e.target.value)} placeholder="Série" required />
            <Button type="submit" className="w-full" loading={loadingEdit}>Salvar</Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}

// Schools Content (global)
function SchoolsContent() {
  const [schools, setSchools] = useState([])
  const [name, setName] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [editTarget, setEditTarget] = useState(null)
  const [editName, setEditName] = useState('')
  const [loadingEdit, setLoadingEdit] = useState(false)
  const [grid, setGrid] = useState(false)

  async function load() {
    try {
      const s = await api.getSchools()
      setSchools(s)
    } catch (e) {
      setError(e.message)
    }
  }

  useEffect(() => { load() }, [])

  async function handleCreate(e) {
    e.preventDefault()
    if (!name.trim()) return
    setLoading(true)
    try {
      await api.createSchool(name.trim())
      setName('')
      load()
    } catch (e) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }

  async function handleEdit(e) {
    e.preventDefault()
    if (!editName.trim()) return
    setLoadingEdit(true)
    try {
      await api.updateSchool(editTarget.id, editName.trim())
      setEditTarget(null)
      setEditName('')
      load()
    } catch (e) {
      setError(e.message)
    } finally {
      setLoadingEdit(false)
    }
  }

  async function handleDelete() {
    try {
      await api.deleteSchool(deleteTarget.id)
      setDeleteTarget(null)
      load()
    } catch (e) {
      setError(e.message)
    }
  }

  return (
    <div className="space-y-6">
      <form onSubmit={handleCreate} className="flex gap-3 max-w-md">
        <Input placeholder="Nome da escola" value={name} onChange={(e) => setName(e.target.value)} required />
        <Button type="submit" loading={loading}>Adicionar</Button>
      </form>
      {error && <p className="text-sm text-red-600">{error}</p>}

      <div className="flex items-center justify-between">
        <span className="text-sm text-slate-500">{schools.length} escola{schools.length !== 1 ? 's' : ''}</span>
        <Button size="icon" variant="outline" onClick={() => setGrid((g) => !g)} title={grid ? 'Visualização em lista' : 'Visualização em grade'}>
          {grid ? <LayoutList className="h-4 w-4" /> : <LayoutGrid className="h-4 w-4" />}
        </Button>
      </div>

      <div className={grid ? 'grid grid-cols-2 gap-2' : 'space-y-2 max-w-md'}>
        {schools.length === 0 && <p className="text-slate-500 text-sm">Nenhuma escola cadastrada.</p>}
        {schools.map((s) => (
          <div key={s.id} className="flex items-center justify-between rounded-lg border border-slate-200 bg-white px-4 py-2">
            <span className="font-medium">{s.name}</span>
            <div className="flex items-center gap-1">
              <Button size="sm" variant="ghost" onClick={() => { setEditTarget(s); setEditName(s.name) }}>
                <Pencil className="h-4 w-4" />
              </Button>
              <Button size="sm" variant="ghost" onClick={() => setDeleteTarget(s)}>
                <Trash2 className="h-4 w-4 text-red-400" />
              </Button>
            </div>
          </div>
        ))}
      </div>

      <ConfirmDeleteDialog
        open={!!deleteTarget}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
        description={`Deseja excluir a escola "${deleteTarget?.name}"?`}
        onConfirm={handleDelete}
      />

      <Dialog open={!!editTarget} onOpenChange={(open) => !open && setEditTarget(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar Escola</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleEdit} className="space-y-4">
            <Input value={editName} onChange={(e) => setEditName(e.target.value)} placeholder="Nome da escola" required />
            <Button type="submit" className="w-full" loading={loadingEdit}>Salvar</Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}

// Matches Content
function MatchesContent({ championshipId }) {
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
  const [loadingCreate, setLoadingCreate] = useState(false)
  const [loadingResult, setLoadingResult] = useState(false)
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
    setLoadingCreate(true)
    try {
      await api.createMatch(championshipId, { title: title.trim(), teamHomeId: teamHome, teamAwayId: teamAway })
      setTitle(''); setTeamHome(''); setTeamAway('')
      load()
    } catch (e) {
      setError(e.message)
    } finally {
      setLoadingCreate(false)
    }
  }

  async function handleResult(e) {
    e.preventDefault()
    setLoadingResult(true)
    try {
      await api.setResult(resultMatch.id, { scoreHome: Number(scoreHome), scoreAway: Number(scoreAway) })
      setResultMatch(null); setScoreHome(''); setScoreAway('')
      load()
    } catch (e) {
      setError(e.message)
    } finally {
      setLoadingResult(false)
    }
  }

  async function handleDelete() {
    try {
      await api.deleteMatch(championshipId, deleteTarget.id)
      setDeleteTarget(null)
      load()
    } catch (e) {
      setError(e.message)
    }
  }

  return (
    <div className="space-y-6">
      <form onSubmit={handleCreate} className="grid grid-cols-2 gap-3 max-w-md">
        <div className="space-y-1 col-span-2">
          <Label>Título</Label>
          <Input placeholder="Ex: Semifinal, Rodada 1..." value={title} onChange={(e) => setTitle(e.target.value)} />
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
        <Button type="submit" className="col-span-2" loading={loadingCreate}>Adicionar Partida</Button>
      </form>

      {error && <p className="text-sm text-red-600">{error}</p>}

      <div className="flex items-center justify-between">
        <span className="text-sm text-slate-500">{matches.length} partida{matches.length !== 1 ? 's' : ''}</span>
        <Button size="icon" variant="outline" onClick={() => setGrid((g) => !g)} title={grid ? 'Visualização em lista' : 'Visualização em grade'}>
          {grid ? <LayoutList className="h-4 w-4" /> : <LayoutGrid className="h-4 w-4" />}
        </Button>
      </div>

      <div className={grid ? 'grid grid-cols-2 gap-2' : 'space-y-2'}>
        {matches.length === 0 && <p className="text-slate-500 text-sm">Nenhuma partida cadastrada.</p>}
        {matches.map((m) => (
          <div key={m.id} className="flex items-center justify-between rounded-lg border border-slate-200 bg-white px-4 py-3">
            <div className="flex flex-col">
              {m.title && <span className="text-xs text-slate-400 font-medium uppercase">{m.title}</span>}
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
                    <Button type="submit" className="w-full" loading={loadingResult}>Salvar</Button>
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
        description={`Deseja excluir a partida "${deleteTarget?.title} — ${deleteTarget?.teamHomeName} vs ${deleteTarget?.teamAwayName}"?`}
        onConfirm={handleDelete}
      />
    </div>
  )
}

// Predictions Content - Batch save
function PredictionsContent({ championshipId }) {
  const [students, setStudents] = useState([])
  const [selectedStudent, setSelectedStudent] = useState('')
  const [cards, setCards] = useState([])
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)
  const [grid, setGrid] = useState(false)

  async function load() {
    try {
      const s = await api.getStudents(championshipId)
      setStudents(s)
    } catch (e) {
      setError(e.message)
    }
  }

  useEffect(() => { load() }, [championshipId])

  async function onStudentChange(val) {
    setSelectedStudent(val)
    setCards([])
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

  async function handleSaveAll() {
    if (!selectedStudent) return
    setSaving(true)
    setError('')
    try {
      const payload = cards.map((c) => ({
        matchId: c.matchId,
        predHome: c.predHome,
        predAway: c.predAway,
      }))
      const updated = await api.savePredictionsBatch(selectedStudent, payload)
      // merge pontos atualizados de volta nos cards
      setCards((prev) =>
        prev.map((c) => {
          const saved = updated.find((u) => u.matchId === c.matchId)
          return saved ? { ...c, pointsAwarded: saved.pointsAwarded } : c
        })
      )
    } catch (e) {
      setError(e.message)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="space-y-6">
      <Select value={selectedStudent} onValueChange={onStudentChange}>
        <SelectTrigger className="w-64"><SelectValue placeholder="Selecione um aluno" /></SelectTrigger>
        <SelectContent>
          {students.map((s) => <SelectItem key={s.id} value={String(s.id)}>{s.name}</SelectItem>)}
        </SelectContent>
      </Select>

      {error && <p className="text-sm text-red-600">{error}</p>}

      {selectedStudent && cards.length > 0 && (
        <>
          <div className="flex items-center justify-between">
            <span className="text-sm text-slate-500">{cards.length} partida{cards.length !== 1 ? 's' : ''}</span>
            <Button size="icon" variant="outline" onClick={() => setGrid((g) => !g)} title={grid ? 'Visualização em lista' : 'Visualização em grade'}>
              {grid ? <LayoutList className="h-4 w-4" /> : <LayoutGrid className="h-4 w-4" />}
            </Button>
          </div>

          <div className={grid ? 'grid grid-cols-2 gap-2' : 'space-y-3'}>
            {cards.map((item) => (
              <div key={item.matchId} className="rounded-lg border border-slate-200 bg-white px-4 py-4 space-y-3">
                <div>
                  {item.title && <p className="text-xs text-slate-400 font-medium uppercase tracking-wide">{item.title}</p>}
                  <p className="font-semibold text-slate-800">{item.teamHomeName} <span className="text-slate-400 font-normal">vs</span> {item.teamAwayName}</p>
                  {item.scoreHome != null && (
                    <p className="text-xs text-slate-500 mt-0.5">Resultado oficial: {item.scoreHome} – {item.scoreAway}</p>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <div className="space-y-1 w-16">
                    <Label className="text-xs">{item.teamHomeName}</Label>
                    <Input
                      type="number"
                      min="0"
                      placeholder="–"
                      className="w-16"
                      value={item.predHome ?? ''}
                      onChange={(e) => handleChange(item.matchId, 'predHome', e.target.value)}
                    />
                  </div>
                  <span className="text-slate-400 mt-5">×</span>
                  <div className="space-y-1 w-16">
                    <Label className="text-xs">{item.teamAwayName}</Label>
                    <Input
                      type="number"
                      min="0"
                      placeholder="–"
                      className="w-16"
                      value={item.predAway ?? ''}
                      onChange={(e) => handleChange(item.matchId, 'predAway', e.target.value)}
                    />
                  </div>
                  {item.pointsAwarded != null && (
                    <div className="mt-5 text-right shrink-0 ml-2">
                      <span className="text-xs text-slate-400">Pontos</span>
                      <p className="font-bold text-slate-700">{item.pointsAwarded}</p>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>

          <Button onClick={handleSaveAll} loading={saving} className="w-full max-w-md">
            {saving ? 'Salvando...' : 'Atualizar Palpites'}
          </Button>
        </>
      )}

      {selectedStudent && cards.length === 0 && !error && (
        <p className="text-slate-500 text-sm">Nenhuma partida encontrada neste campeonato.</p>
      )}
    </div>
  )
}

// Ranking Content
function RankingContent({ championshipId }) {
  const [ranking, setRanking] = useState([])
  const [schools, setSchools] = useState([])
  const [schoolId, setSchoolId] = useState('all')
  const [serie, setSerie] = useState('')
  const [error, setError] = useState('')
  const [loadingFilter, setLoadingFilter] = useState(false)
  const [grid, setGrid] = useState(false)

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
    if (schoolId && schoolId !== 'all') params.schoolId = schoolId
    if (serie.trim()) params.serie = serie.trim()
    setLoadingFilter(true)
    load(params).finally(() => setLoadingFilter(false))
  }

  return (
    <div className="space-y-6">
      <form onSubmit={handleFilter} className="flex flex-wrap gap-3 items-end max-w-xl">
        <div className="space-y-1 w-48">
          <Label>Escola</Label>
          <Select value={schoolId} onValueChange={setSchoolId}>
            <SelectTrigger><SelectValue placeholder="Todas" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas</SelectItem>
              {schools.map((s) => <SelectItem key={s.id} value={String(s.id)}>{s.name}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1">
          <Label>Série</Label>
          <Input placeholder="Ex: 9A" value={serie} onChange={(e) => setSerie(e.target.value)} className="w-28" />
        </div>
        <Button type="submit" loading={loadingFilter}>Filtrar</Button>
      </form>

      {error && <p className="text-sm text-red-600">{error}</p>}

      <div className="flex items-center justify-between">
        <span className="text-sm text-slate-500">{ranking.length} posição{ranking.length !== 1 ? 's' : ''}</span>
        <Button size="icon" variant="outline" onClick={() => setGrid((g) => !g)} title={grid ? 'Visualização em lista' : 'Visualização em grade'}>
          {grid ? <LayoutList className="h-4 w-4" /> : <LayoutGrid className="h-4 w-4" />}
        </Button>
      </div>

      {grid ? (
        <div className="grid grid-cols-2 gap-2">
          {ranking.length === 0 && <p className="text-slate-500 text-sm">Sem dados.</p>}
          {ranking.map((r, i) => (
            <div key={r.studentId ?? i} className="flex items-center justify-between rounded-lg border border-slate-200 bg-white px-4 py-3">
              <div className="flex items-center gap-3">
                <span className="flex items-center justify-center w-8 h-8 rounded-full bg-slate-100 text-slate-600 font-bold text-sm">{i + 1}</span>
                <div>
                  <div className="font-medium">{r.studentName ?? r.name}</div>
                  <div className="text-sm text-slate-400">{r.schoolName} • {r.serie}</div>
                </div>
              </div>
              <span className="text-lg font-bold text-slate-600">{r.points ?? r.totalPoints ?? 0}</span>
            </div>
          ))}
        </div>
      ) : (
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
      )}
    </div>
  )
}