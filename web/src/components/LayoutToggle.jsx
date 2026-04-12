import { LayoutList, LayoutGrid } from 'lucide-react'
import { Button } from '@/components/ui/button'

export function LayoutToggle({ grid, onToggle }) {
  return (
    <Button size="icon" variant="outline" onClick={onToggle} title={grid ? 'Visualização em lista' : 'Visualização em grade'}>
      {grid ? <LayoutList className="h-4 w-4" /> : <LayoutGrid className="h-4 w-4" />}
    </Button>
  )
}
