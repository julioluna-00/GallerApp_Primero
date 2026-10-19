import { useEffect, useMemo, useState } from 'react'
import { apiRequest } from '../lib/api'
import { RoosterLogo } from '../components/RoosterLogo'

type RoosterStatus = 'active' | 'inactive'
type DirectoryFilter = 'all' | RoosterStatus

interface RoosterDirectoryProps {
  signedInUser: { nombre: string; apellido: string; role: 'administrador' | 'usuario'; profileImage?: string } | null
  onBack: () => void
  onGoEvents: () => void
  onGoRegisterRooster: () => void
  onGoAdmin: () => void
  onGoAbout: () => void
  onGoLogin: () => void
  onGoRegister: () => void
  onGoProfile: () => void
  onLogout: () => void
  isAdmin: boolean
}

interface Rooster {
  id: string
  name: string
  code: string
  breed: string
  weight: string
  age: string
  arena: string
  owner: string
  wins: number
  fights: number
  status: RoosterStatus
  image: string
}

function Icon({ name }: { name: 'trophy' | 'scale' | 'calendar' | 'pin' | 'user' }) {
  const paths = {
    trophy: <><path d="M8 21h8M12 17v4M7 4h10v4a5 5 0 0 1-10 0V4Z" /><path d="M7 6H4v2a4 4 0 0 0 4 4M17 6h3v2a4 4 0 0 1-4 4" /></>,
    scale: <><path d="M12 3v18M5 6h14M5 6l-3 7h6L5 6ZM19 6l-3 7h6l-3-7ZM8 21h8" /></>,
    calendar: <><rect x="3" y="5" width="18" height="16" rx="2" /><path d="M16 3v4M8 3v4M3 10h18" /></>,
    pin: <><path d="M20 10c0 5-8 11-8 11S4 15 4 10a8 8 0 1 1 16 0Z" /><circle cx="12" cy="10" r="2.5" /></>,
    user: <><circle cx="12" cy="8" r="4" /><path d="M4 21a8 8 0 0 1 16 0" /></>,
  }
  return (
    <svg className="h-4 w-4 flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      {paths[name]}
    </svg>
  )
}

function RoosterCard({ rooster, isAdmin, onWin, onToggleStatus, onDelete, disabled }: { rooster: Rooster; isAdmin: boolean; onWin: () => void; onToggleStatus: () => void; onDelete: () => void; disabled: boolean }) {
  const isActive = rooster.status === 'active'

  return (
    <article className="group overflow-hidden rounded-2xl border border-[#2A2A2A] bg-[#141414] transition-all duration-300 hover:-translate-y-1 hover:border-[#D71920]/50 hover:shadow-2xl hover:shadow-black/50">
      <div className="relative h-56 overflow-hidden">
        <img src={rooster.image} alt={`Gallo registrado ${rooster.name}`} className={`h-full w-full object-cover transition-transform duration-500 group-hover:scale-105 ${isActive ? '' : 'grayscale'}`} />
        <div className="absolute inset-0 bg-gradient-to-t from-[#141414] via-transparent to-black/30" />
        <span className={`absolute left-4 top-4 inline-flex items-center gap-2 rounded-full border px-3 py-1.5 font-heading text-[9px] font-black tracking-[0.18em] ${isActive ? 'border-[#176B45]/60 bg-[#176B45]/90 text-[#F5F5F5]' : 'border-[#555] bg-[#202020]/95 text-[#A3A3A3]'}`}>
          <span className={`h-1.5 w-1.5 rounded-full ${isActive ? 'bg-[#73D3A6]' : 'bg-[#777]'}`} />
          {isActive ? 'ACTIVO' : 'YA NO ESTÁ ACTIVO'}
        </span>
        <div className="absolute bottom-4 right-4 flex min-w-24 items-center justify-center gap-2 rounded-xl border border-[#D99024]/40 bg-black/75 px-4 py-2.5 text-[#D99024] backdrop-blur-md">
          <Icon name="trophy" />
          <strong className="font-heading text-2xl font-black">{rooster.wins}</strong>
          <span className="font-heading text-[8px] font-bold uppercase leading-3 tracking-wider text-[#D7B16B]">batallas<br />ganadas</span>
        </div>
      </div>

      <div className="p-5">
        <div className="flex items-start justify-between gap-4">
          <div>
            <span className="font-heading text-[9px] font-bold tracking-[0.2em] text-[#D71920]">{rooster.code}</span>
            <h2 className="mt-1 font-heading text-xl font-black uppercase text-[#F5F5F5]">{rooster.name}</h2>
          </div>
          <div className="text-right">
            <strong className="font-heading text-sm font-black text-[#F5F5F5]">{rooster.wins}–{rooster.fights - rooster.wins}</strong>
            <span className="block text-[9px] uppercase tracking-wider text-[#666]">récord</span>
          </div>
        </div>

        <div className="mt-5 grid grid-cols-2 gap-x-4 gap-y-3 border-y border-[#262626] py-4 text-xs text-[#A3A3A3]">
          <span className="flex items-center gap-2"><Icon name="scale" /> {rooster.weight}</span>
          <span className="flex items-center gap-2"><Icon name="calendar" /> {rooster.age}</span>
          <span className="flex items-center gap-2"><Icon name="pin" /> {rooster.arena}</span>
          <span className="font-heading text-[10px] font-bold uppercase tracking-wider text-[#D99024]">{rooster.breed}</span>
        </div>

        <div className="mt-4 flex items-center gap-2 text-xs text-[#777]">
          <Icon name="user" />
          <span className="truncate">{rooster.owner}</span>
        </div>
        {isAdmin && <div className="mt-5 flex flex-wrap items-center gap-2 border-t border-[#262626] pt-4">
          {isActive && <>
            <button disabled={disabled} onClick={onWin} className="rounded bg-[#176B45] px-3 py-2 text-[10px] font-black tracking-wider text-white disabled:opacity-50">+ SUMAR VICTORIA</button>
            <button disabled={disabled} onClick={onToggleStatus} className="rounded border border-[#555] px-3 py-2 text-[10px] font-black tracking-wider text-[#D0D0D0] disabled:opacity-50">MARCAR INACTIVO</button>
          </>}
          {!isActive && <span className="rounded border border-[#555] bg-[#202020] px-3 py-2 text-[10px] font-black tracking-wider text-[#A3A3A3]">BAJA DEFINITIVA</span>}
          <button disabled={disabled} onClick={onDelete} className="rounded border border-[#D71920]/40 px-3 py-2 text-[10px] font-black tracking-wider text-[#F58A8E] disabled:opacity-50">ELIMINAR</button>
        </div>}
      </div>
    </article>
  )
}

export default function RoosterDirectory({ signedInUser, onBack, onGoEvents, onGoRegisterRooster, onGoAbout, onGoAdmin, onGoLogin, onGoRegister, onGoProfile, onLogout, isAdmin }: RoosterDirectoryProps) {
  const [filter, setFilter] = useState<DirectoryFilter>('all')
  const [roosters, setRoosters] = useState<Rooster[]>([])
  const [loadError, setLoadError] = useState('')
  const [loading, setLoading] = useState(true)
  const [busyId, setBusyId] = useState<string | null>(null)

  async function refresh(showLoading = false) {
    if (showLoading) setLoading(true)
    try {
      const result = await apiRequest<{ roosters: Rooster[] }>('/roosters')
      setRoosters(result.roosters)
      setLoadError('')
    } catch (err) {
      setLoadError(err instanceof Error ? err.message : 'No se pudo cargar el directorio de gallos.')
    } finally { if (showLoading) setLoading(false) }
  }
  useEffect(() => {
    void refresh(true)
    const interval = window.setInterval(() => { void refresh() }, 3000)
    return () => window.clearInterval(interval)
  }, [])

  const visibleRoosters = useMemo(
    () => roosters.filter(rooster => filter === 'all' || rooster.status === filter),
    [roosters, filter],
  )
  const activeCount = roosters.filter(rooster => rooster.status === 'active').length
  const totalWins = roosters.reduce((total, rooster) => total + rooster.wins, 0)

  async function updateRooster(id: string, path: string, method: 'POST' | 'PUT' | 'DELETE', body?: unknown) {
    setBusyId(id)
    setLoadError('')
    try {
      await apiRequest(path, body, method)
      await refresh()
    } catch (err) {
      setLoadError(err instanceof Error ? err.message : 'No se pudo actualizar el gallo.')
    } finally { setBusyId(null) }
  }

  function addWin(rooster: Rooster) {
    void updateRooster(rooster.id, `/admin/roosters/${rooster.id}/wins`, 'POST')
  }
  function toggleStatus(rooster: Rooster) {
    if (rooster.status !== 'active') return
    void updateRooster(rooster.id, `/admin/roosters/${rooster.id}`, 'PUT', { status: 'inactive' })
  }
  function deleteRooster(rooster: Rooster) {
    if (window.confirm(`¿Eliminar a ${rooster.name} del directorio?`)) void updateRooster(rooster.id, `/admin/roosters/${rooster.id}`, 'DELETE')
  }

  return (
    <div className="min-h-screen overflow-x-hidden bg-[#0B0B0B] text-[#F5F5F5] font-body">
      <header className="sticky top-0 z-50 border-b border-[#D71920]/20 bg-[#0B0B0B]/95 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-[1440px] items-center justify-between gap-3 px-4 sm:px-6">
          <button onClick={onBack} className="group flex flex-shrink-0 items-center gap-2 sm:gap-3">
            <RoosterLogo size={38} />
            <span className="font-heading text-lg font-black tracking-wider sm:text-xl">GALLER<span className="text-[#D71920]">APP</span></span>
          </button>

          <nav className="hidden items-center gap-1 md:flex">
            <button onClick={onBack} className="rounded px-3 py-2 font-heading text-[10px] font-semibold tracking-wider text-[#A3A3A3] transition-colors hover:bg-[#171717] hover:text-white xl:text-xs xl:tracking-widest">PELEAS</button>
            <button onClick={onGoEvents} className="rounded px-3 py-2 font-heading text-[10px] font-semibold tracking-wider text-[#A3A3A3] transition-colors hover:bg-[#171717] hover:text-white xl:text-xs xl:tracking-widest">EVENTOS</button>
            <button onClick={onGoRegisterRooster} className="rounded px-3 py-2 font-heading text-[10px] font-semibold tracking-wider text-[#A3A3A3] transition-colors hover:bg-[#171717] hover:text-white xl:text-xs xl:tracking-widest">INSCRIBE TU GALLO</button>
            <button className="rounded bg-[#171717] px-3 py-2 font-heading text-[10px] font-semibold tracking-wider text-white xl:text-xs xl:tracking-widest">GALLOS</button>
            <button onClick={onGoAbout} className="rounded px-3 py-2 font-heading text-[10px] font-semibold tracking-wider text-[#A3A3A3] transition-colors hover:bg-[#171717] hover:text-white xl:text-xs xl:tracking-widest">QUIÉNES SOMOS</button>
          </nav>

          <div className="flex flex-shrink-0 items-center gap-2 sm:gap-3">
            {signedInUser ? (
              <>
                <div className="hidden items-center gap-2 rounded border border-[#2A2A2A] bg-[#171717] px-3 py-2 sm:flex">
                  {signedInUser.profileImage ? <img src={signedInUser.profileImage} alt="" className="h-7 w-7 rounded-full object-cover" /> : <span className="flex h-7 w-7 items-center justify-center rounded-full bg-[#D71920] font-heading text-[10px] font-black text-white">{signedInUser.nombre.charAt(0).toUpperCase()}</span>}
                  <span className="max-w-28 truncate font-heading text-xs font-bold text-white">{signedInUser.nombre} {signedInUser.apellido}</span>
                  <span className="rounded bg-[#2A2A2A] px-1.5 py-1 font-heading text-[8px] font-black text-[#A3A3A3]">{signedInUser.role === 'administrador' ? 'ADMIN' : 'USUARIO'}</span>
                </div>
                {isAdmin && <button onClick={onGoAdmin} className="rounded bg-[#D71920] px-3 py-2 font-heading text-[9px] font-black tracking-wider text-white sm:px-4 sm:text-[10px]">PANEL ADMIN</button>}
                <button onClick={onGoProfile} className="hidden rounded border border-[#2A2A2A] px-3 py-2 font-heading text-[10px] font-bold tracking-wider text-[#A3A3A3] hover:text-white md:block">MI PERFIL</button>
                <button onClick={onLogout} className="rounded border border-[#2A2A2A] px-3 py-2 font-heading text-[10px] font-bold tracking-wider text-[#A3A3A3] hover:text-white">SALIR</button>
              </>
            ) : (
              <>
            <button onClick={onGoAdmin} className="rounded border border-[#D99024]/50 bg-[#D99024]/10 px-2.5 py-2 font-heading text-[9px] font-black tracking-wider text-[#D99024] transition-all hover:bg-[#D99024] hover:text-[#0B0B0B] sm:px-4">ADMIN</button>
            <button onClick={onGoLogin} className="hidden rounded border border-[#2A2A2A] px-4 py-2 font-heading text-xs font-bold tracking-widest text-[#A3A3A3] transition-colors hover:text-white lg:block">ENTRAR</button>
            <button onClick={onGoRegister} className="rounded bg-[#D71920] px-3 py-2 font-heading text-[10px] font-bold tracking-widest text-white shadow-lg shadow-[#D71920]/20 transition-colors hover:bg-[#A01218] sm:px-4 sm:text-xs">REGISTRARSE</button>
              </>
            )}
          </div>
        </div>
        <nav className="flex items-center justify-center gap-1 border-t border-[#1F1F1F] px-2 py-2 md:hidden">
          <button onClick={onBack} className="px-2 py-1 font-heading text-[9px] font-bold tracking-wider text-[#777]">PELEAS</button>
          <button onClick={onGoEvents} className="px-2 py-1 font-heading text-[9px] font-bold tracking-wider text-[#777]">EVENTOS</button>
          <button onClick={onGoRegisterRooster} className="px-2 py-1 font-heading text-[9px] font-bold tracking-wider text-[#777]">INSCRIBIR</button>
          <button className="rounded bg-[#1C1C1C] px-2 py-1 font-heading text-[9px] font-bold tracking-wider text-white">GALLOS</button>
        </nav>
      </header>

      <main>
        <section className="relative overflow-hidden border-b border-[#2A2A2A]">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_78%_20%,rgba(215,25,32,0.2),transparent_38%)]" />
          <div className="relative mx-auto max-w-[1280px] px-5 py-12 sm:px-6 md:py-16">
            <div className="mb-5 flex items-center gap-3">
              <span className="h-px w-10 bg-[#D71920]" />
              <span className="font-heading text-[10px] font-bold tracking-[0.3em] text-[#D71920]">COMPETIDORES REGISTRADOS</span>
            </div>
            <div className="flex flex-col justify-between gap-8 lg:flex-row lg:items-end">
              <div>
                <h1 className="font-heading text-4xl font-black uppercase leading-tight tracking-tight md:text-6xl">Nuestros <span className="text-[#D99024]">gallos</span></h1>
                <p className="mt-4 max-w-2xl text-sm leading-7 text-[#A3A3A3] md:text-base">Consulta la ficha, el récord de batalla y el estado actual de cada competidor inscrito.</p>
              </div>
              <div className="grid grid-cols-3 overflow-hidden rounded-xl border border-[#2A2A2A] bg-[#141414]">
                <div className="px-5 py-4 text-center"><strong className="block font-heading text-2xl font-black">{roosters.length}</strong><span className="text-[9px] uppercase tracking-wider text-[#777]">Registrados</span></div>
                <div className="border-x border-[#2A2A2A] px-5 py-4 text-center"><strong className="block font-heading text-2xl font-black text-[#53B889]">{activeCount}</strong><span className="text-[9px] uppercase tracking-wider text-[#777]">Activos</span></div>
                <div className="px-5 py-4 text-center"><strong className="block font-heading text-2xl font-black text-[#D99024]">{totalWins}</strong><span className="text-[9px] uppercase tracking-wider text-[#777]">Victorias</span></div>
              </div>
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-[1280px] px-5 py-9 sm:px-6">
          <div className="mb-8 flex flex-col gap-4 border-b border-[#262626] pb-6 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex gap-2">
              {([
                ['all', 'Todos'],
                ['active', 'Activos'],
                ['inactive', 'No activos'],
              ] as Array<[DirectoryFilter, string]>).map(([value, label]) => (
                <button key={value} onClick={() => setFilter(value)} className={`rounded-full border px-4 py-2 font-heading text-[10px] font-black uppercase tracking-wider transition-all ${filter === value ? 'border-[#D71920] bg-[#D71920] text-white' : 'border-[#333] bg-[#141414] text-[#888] hover:border-[#D71920]/60 hover:text-white'}`}>{label}</button>
              ))}
            </div>
            <button onClick={onGoRegisterRooster} className="inline-flex items-center justify-center gap-3 rounded-lg bg-[#D71920] px-6 py-3 font-heading text-[10px] font-black tracking-widest text-white shadow-lg shadow-[#D71920]/20 transition-all hover:-translate-y-0.5 hover:bg-[#A01218]">
              INSCRIBIR UN GALLO <span aria-hidden="true">→</span>
            </button>
          </div>

          {loadError && <p role="alert" className="mb-5 rounded-xl border border-[#D71920]/40 bg-[#D71920]/10 p-3 text-sm text-[#F5A0A3]">{loadError}</p>}
          {loading ? <p className="py-10 text-center text-sm text-[#888]">Cargando gallos…</p> : visibleRoosters.length ? <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {visibleRoosters.map(rooster => <RoosterCard key={rooster.id} rooster={rooster} isAdmin={isAdmin} disabled={busyId === rooster.id} onWin={() => addWin(rooster)} onToggleStatus={() => toggleStatus(rooster)} onDelete={() => deleteRooster(rooster)} />)}
          </div> : <p className="rounded-xl border border-dashed border-[#333] p-10 text-center text-sm text-[#888]">No hay gallos para este filtro.</p>}
        </section>
      </main>

      <footer className="border-t border-[#1F1F1F] px-6 py-7">
        <div className="mx-auto flex max-w-[1440px] flex-wrap items-center justify-between gap-4">
          <button onClick={onBack} className="flex items-center gap-3"><RoosterLogo size={24} /><span className="font-heading text-sm font-black tracking-wider text-[#A3A3A3]">GALLER<span className="text-[#D71920]">APP</span></span></button>
          <p className="font-heading text-[10px] tracking-widest text-[#555]">© 2026 GallerApp · DIRECTORIO DE GALLOS</p>
        </div>
      </footer>
    </div>
  )
}
