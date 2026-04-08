import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Trophy, ChevronRight } from 'lucide-react'
import { api } from '@/api'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

export default function Championships() {
  const [championships, setChampionships] = useState([])
  const [name, setName] = useState('')
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

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Campeonatos</h1>

      <form onSubmit={handleCreate} className="flex gap-2 max-w-md">
        <Input
          placeholder="Nome do campeonato"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <Button type="submit">Criar</Button>
      </form>

      {error && <p className="text-sm text-red-600">{error}</p>}

      <div className="space-y-2">
        {championships.length === 0 && (
          <p className="text-slate-500 text-sm">Nenhum campeonato cadastrado.</p>
        )}
        {championships.map((c) => (
          <button
            key={c.id}
            onClick={() => navigate(`/championships/${c.id}`)}
            className="flex w-full items-center justify-between rounded-lg border border-slate-200 bg-white px-4 py-3 text-left hover:bg-slate-50 transition-colors"
          >
            <div className="flex items-center gap-3">
              <Trophy className="h-5 w-5 text-slate-400" />
              <span className="font-medium">{c.name}</span>
            </div>
            <ChevronRight className="h-4 w-4 text-slate-400" />
          </button>
        ))}
      </div>
    </div>
  )
}
