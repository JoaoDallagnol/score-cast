import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'

export function ConfirmDeleteDialog({ open, onOpenChange, title, description, onConfirm, loading }) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="text-red-700">Confirmar exclusão</DialogTitle>
        </DialogHeader>
        <p className="text-sm text-slate-700">{description}</p>
        <div className="flex gap-3 mt-2">
          <Button variant="outline" className="flex-1" onClick={() => onOpenChange(false)} disabled={loading}>
            Cancelar
          </Button>
          <Button variant="destructive" className="flex-1" onClick={onConfirm} disabled={loading}>
            {loading ? 'Excluindo...' : 'Confirmar exclusão'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
