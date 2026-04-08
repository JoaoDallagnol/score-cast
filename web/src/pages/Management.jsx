import { useState } from 'react'
import { Download, Trash2, ShieldAlert } from 'lucide-react'
import { api } from '@/api'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'

export default function Management() {
  const [backupResult, setBackupResult] = useState(null)
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [cleared, setCleared] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleBackup() {
    setError('')
    setLoading(true)
    try {
      const result = await api.backup()
      setBackupResult(result)
    } catch (e) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }

  async function handleClear() {
    setError('')
    setLoading(true)
    try {
      await api.clearAll()
      setCleared(true)
      setConfirmOpen(false)
      setBackupResult(null)
    } catch (e) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-8 max-w-lg">
      <h1 className="text-2xl font-bold">Gerenciamento</h1>

      {error && <p className="text-sm text-red-600">{error}</p>}

      {/* Backup */}
      <div className="rounded-lg border border-slate-200 bg-white p-6 space-y-3">
        <div className="flex items-center gap-3">
          <Download className="h-5 w-5 text-slate-500" />
          <div>
            <p className="font-semibold">Backup do banco de dados</p>
            <p className="text-sm text-slate-500">Gera uma cópia de segurança de todos os dados.</p>
          </div>
        </div>
        <Button onClick={handleBackup} disabled={loading} variant="outline" className="w-full">
          {loading ? 'Gerando...' : 'Fazer Backup'}
        </Button>
        {backupResult && (
          <div className="rounded-md border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-800 space-y-1">
            <p className="font-medium">Backup gerado com sucesso!</p>
            <p className="font-mono text-xs break-all">{backupResult.file}</p>
            <p className="text-xs text-green-600">{new Date(backupResult.createdAt).toLocaleString('pt-BR')}</p>
          </div>
        )}
      </div>

      {/* Limpar dados */}
      <div className="rounded-lg border border-red-200 bg-white p-6 space-y-3">
        <div className="flex items-center gap-3">
          <Trash2 className="h-5 w-5 text-red-500" />
          <div>
            <p className="font-semibold text-red-700">Limpar todos os dados</p>
            <p className="text-sm text-slate-500">Remove permanentemente todos os registros do sistema.</p>
          </div>
        </div>
        <Button
          variant="destructive"
          className="w-full"
          onClick={() => { setConfirmOpen(true); setCleared(false) }}
        >
          Limpar Dados
        </Button>
        {cleared && (
          <div className="rounded-md border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-600">
            Todos os dados foram removidos com sucesso.
          </div>
        )}
      </div>

      {/* Modal de confirmação */}
      <Dialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-red-700">
              <ShieldAlert className="h-5 w-5" />
              Atenção: ação irreversível
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 text-sm text-slate-700">
            <p>
              Você está prestes a <span className="font-bold text-red-700">apagar permanentemente todos os dados</span> do sistema, incluindo campeonatos, alunos, partidas, palpites e rankings.
            </p>
            <div className="rounded-md border border-amber-200 bg-amber-50 px-4 py-3 text-amber-800">
              💾 Recomendamos fortemente que você <span className="font-semibold">faça um backup antes</span> de prosseguir. Use o botão "Fazer Backup" na página de Gerenciamento.
            </div>
            <p>Deseja realmente prosseguir? <span className="font-semibold">Esta ação não pode ser desfeita.</span></p>
          </div>
          <div className="flex gap-3 mt-2">
            <Button variant="outline" className="flex-1" onClick={() => setConfirmOpen(false)}>
              Cancelar
            </Button>
            <Button variant="destructive" className="flex-1" onClick={handleClear} disabled={loading}>
              {loading ? 'Limpando...' : 'Sim, apagar tudo'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
