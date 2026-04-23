import { ArrowUp, ArrowDown } from 'lucide-react'
import { Button } from '@/components/ui/button'

export function SortToggle({ isAscending, onToggle }) {
  return (
    <button
      onClick={onToggle}
      className="inline-flex items-center justify-center h-9 w-9 rounded-md border border-slate-300 bg-white hover:bg-slate-100 active:bg-slate-200 transition-all"
      title={isAscending ? 'Ordenar decrescente' : 'Ordenar crescente'}
      type="button"
    >
      {isAscending ? (
        <ArrowUp className="h-4 w-4 text-slate-600" />
      ) : (
        <ArrowDown className="h-4 w-4 text-slate-600" />
      )}
    </button>
  )
}