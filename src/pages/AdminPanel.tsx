import { useEffect, useState } from 'react'
import { apiRequest } from '../lib/api'
import EventsManager from './EventsManager'
import FightsManager from './FightsManager'

interface AdminSummary {
  message: string
  role: string
  totalUsuarios: number
  totalAdministradores: number
}

export default function AdminPanel({ onBack }: { onBack: () => void }) {
  const [summary, setSummary] = useState<AdminSummary | null>(null)
  const [error, setError] = useState('')

  useEffect(() => {
    apiRequest<AdminSummary>('/admin/summary')
      .then(setSummary)
      .catch((err: unknown) => setError(err instanceof Error ? err.message : 'No se pudo verificar el permiso.'))
  }, [])

  return (
    <main className="min-h-screen bg-[#0B0B0B] px-5 py-10 text-[#F5F5F5]">
      <section className="mx-auto max-w-6xl rounded-2xl border border-[#2A2A2A] bg-[#171717] p-8">
        <p className="mb-2 text-xs font-bold tracking-[0.2em] text-[#D71920]">GALLERAPP · ADMINISTRACIÓN</p>
        <h1 className="mb-2 text-2xl font-black">Panel de administrador</h1>
        <p className="mb-6 text-sm text-[#A3A3A3]">Administra la cartelera, programa peleas y registra sus resultados oficiales.</p>
        {error && <p role="alert" className="mb-4 rounded-xl border border-[#D71920]/40 bg-[#D71920]/10 p-3 text-sm text-[#F5A0A3]">{error}</p>}
        {summary && (
          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-xl border border-[#2A2A2A] bg-[#0F0F0F] p-4"><p className="text-xs text-[#A3A3A3]">Usuarios normales</p><p className="mt-2 text-2xl font-bold">{summary.totalUsuarios}</p></div>
            <div className="rounded-xl border border-[#2A2A2A] bg-[#0F0F0F] p-4"><p className="text-xs text-[#A3A3A3]">Administradores</p><p className="mt-2 text-2xl font-bold">{summary.totalAdministradores}</p></div>
          </div>
        )}
        {!summary && !error && <p className="text-sm text-[#A3A3A3]">Verificando permisos…</p>}
        {summary && <><EventsManager /><FightsManager /></>}
        <button onClick={onBack} className="mt-6 rounded-lg border border-[#333] px-4 py-2 text-sm font-bold text-[#A3A3A3] hover:text-white">VOLVER AL INICIO</button>
      </section>
    </main>
  )
}
