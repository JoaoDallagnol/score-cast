import { useEffect, useState } from 'react'
import { School } from 'lucide-react'
import { api } from '@/api'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

export default function Schools() {
  const [schools, setSchools] = useState([])
  const [name, setName] = useState('')
  const [error, setError] = useState('')

  async function load() {
    try {
      setSchools(await api.getSchools())
    } catch (e) {
      setError(e.message)
    }
  }

  useEffect(() => { load() }, [])

  async function handleCreate(e) {
    e.preventDefault()
    if (!name.trim()) return
    try {
      await api.createSchool(name.trim())
      setName('')
      load()
    } catch (e) {
      setError(e.message)
    }
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Escolas</h1>

      <form onSubmit={handleCreate} className="flex gap-2 max-w-md">
        <Input
          placeholder="Nome da escola"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <Button type="submit">Criar</Button>
      </form>

      {error && <p className="text-sm text-red-600">{error}</p>}

      <div className="space-y-2">
        {schools.length === 0 && <p className="text-slate-500 text-sm">Nenhuma escola cadastrada.</p>}
        {schools.map((s) => (
          <div key={s.id} className="flex items-center gap-3 rounded-lg border border-slate-200 bg-white px-4 py-3">
            <School className="h-5 w-5 text-slate-400" />
            <span className="font-medium">{s.name}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
