import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import { api } from '@/api'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import MatchesTab from './MatchesTab'
import StudentsTab from './StudentsTab'
import RankingTab from './RankingTab'

export default function ChampionshipDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [championship, setChampionship] = useState(null)
  const [error, setError] = useState('')

  useEffect(() => {
    api.getChampionship(id).then(setChampionship).catch((e) => setError(e.message))
  }, [id])

  if (error) return <p className="text-red-600">{error}</p>
  if (!championship) return <p className="text-slate-400">Carregando...</p>

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={() => navigate('/')}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <h1 className="text-2xl font-bold">{championship.name}</h1>
      </div>

      <Tabs defaultValue="matches">
        <TabsList>
          <TabsTrigger value="matches">Partidas</TabsTrigger>
          <TabsTrigger value="students">Alunos</TabsTrigger>
          <TabsTrigger value="ranking">Ranking</TabsTrigger>
        </TabsList>
        <TabsContent value="matches"><MatchesTab championshipId={id} /></TabsContent>
        <TabsContent value="students"><StudentsTab championshipId={id} /></TabsContent>
        <TabsContent value="ranking"><RankingTab championshipId={id} /></TabsContent>
      </Tabs>
    </div>
  )
}
