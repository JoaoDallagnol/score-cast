import { useEffect, useState } from 'react'
import { api } from '@/api'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select'

export default function StudentsTab({ championshipId }) {
  const [students, setStudents] = useState([])
  const [schools, setSchools] = useState([])
  const [name, setName] = useState('')
  const [serie, setSerie] = useState('')
  const [schoolId, setSchoolId] = useState('')
  const [error, setError] = useState('')

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
    if (!name.trim() || !serie.trim() || !schoolId) return
    try {
      await api.createStudent(championshipId, { name: name.trim(), serie: serie.trim(), schoolId })
      setName('')
      setSerie('')
      setSchoolId('')
      load()
    } catch (e) {
      setError(e.message)
    }
  }

  return (
    <div className="space-y-6">
      <form onSubmit={handleCreate} className="grid grid-cols-2 gap-3 max-w-md">
        <div className="space-y-1 col-span-2">
          <Label>Nome</Label>
          <Input placeholder="Nome do aluno" value={name} onChange={(e) => setName(e.target.value)} />
        </div>
        <div className="space-y-1">
          <Label>Série</Label>
          <Input placeholder="Ex: 9A" value={serie} onChange={(e) => setSerie(e.target.value)} />
        </div>
        <div className="space-y-1">
          <Label>Escola</Label>
          <Select value={schoolId} onValueChange={setSchoolId}>
            <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
            <SelectContent>
              {schools.map((s) => <SelectItem key={s.id} value={String(s.id)}>{s.name}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
        <Button type="submit" className="col-span-2">Cadastrar Aluno</Button>
      </form>

      {error && <p className="text-sm text-red-600">{error}</p>}

      <div className="space-y-2">
        {students.length === 0 && <p className="text-slate-500 text-sm">Nenhum aluno cadastrado.</p>}
        {students.map((s) => (
          <div key={s.id} className="flex items-center gap-4 rounded-lg border border-slate-200 bg-white px-4 py-3">
            <span className="font-medium flex-1">{s.name}</span>
            <span className="text-sm text-slate-500">{s.serie}</span>
            <span className="text-sm text-slate-500">{s.schoolName ?? s.school?.name}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
