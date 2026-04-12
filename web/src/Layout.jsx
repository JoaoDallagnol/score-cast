import { NavLink, Outlet } from 'react-router-dom'
import { Trophy, School, GraduationCap, Shield, Target, Settings } from 'lucide-react'
import { cn } from '@/lib/utils'

const links = [
  { to: '/', label: 'Campeonatos', icon: Trophy, end: true },
  { to: '/schools', label: 'Escolas', icon: School },
  { to: '/students', label: 'Alunos', icon: GraduationCap },
  { to: '/teams', label: 'Times', icon: Shield },
  { to: '/predictions', label: 'Palpites', icon: Target },
  { to: '/management', label: 'Gerenciamento', icon: Settings },
]

export default function Layout() {
  return (
    <div className="flex min-h-screen bg-slate-50">
      <aside className="w-56 shrink-0 border-r border-slate-200 bg-white flex flex-col">
        <div className="px-6 py-5 border-b border-slate-100">
          <span className="text-lg font-bold tracking-tight">⚽ ScoreCast</span>
        </div>
        <nav className="flex-1 p-3 space-y-1">
          {links.map(({ to, label, icon: Icon, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={({ isActive }) =>
                cn(
                  'flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors',
                  isActive
                    ? 'bg-slate-900 text-white'
                    : 'text-slate-600 hover:bg-slate-100'
                )
              }
            >
              <Icon className="h-4 w-4" />
              {label}
            </NavLink>
          ))}
        </nav>
      </aside>
      <main className="flex-1 p-8 overflow-auto">
        <Outlet />
      </main>
    </div>
  )
}
