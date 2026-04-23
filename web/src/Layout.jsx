import { Outlet } from 'react-router-dom'

export default function Layout() {
  return (
    <div className="min-h-screen bg-slate-50">
      <main className="p-8">
        <Outlet />
      </main>
    </div>
  )
}