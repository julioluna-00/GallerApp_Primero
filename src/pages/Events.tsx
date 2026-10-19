import { useEffect, useMemo, useRef, useState } from 'react'
import { apiRequest } from '../lib/api'
import { RoosterLogo } from '../components/RoosterLogo'
import eventArenaImage from '../imports/eventos-gallera.jpg'

type EventStatus = 'live' | 'upcoming' | 'finished'
type Filter = 'all' | EventStatus

interface EventsProps {
  signedInUser: { nombre: string; apellido: string; role: 'administrador' | 'usuario'; profileImage?: string } | null
  onBack: () => void
  onGoRoosters: () => void
  onGoRoosterDirectory: () => void
  onGoRegisterRooster: () => void
  onGoAbout: () => void
  onGoLogin: () => void
  onGoAdmin: () => void
  onGoRegister: () => void
  onGoProfile: () => void
  onLogout: () => void
}

interface PublicFight { id: string; number: number; eventId: string; roosterA: { id: string; name: string }; roosterB: { id: string; name: string }; oddsA: number; oddsB: number; status: 'upcoming' | 'live' | 'finished'; winnerRoosterId: string | null; winnerRoosterName: string | null }

interface EventItem {
  id: string
  name: string
  date: string
  time: string
  arena: string
  fights: number
  status: EventStatus
  prize: number
  image: string
}

const arenaImages = [
  eventArenaImage,
  eventArenaImage,
  eventArenaImage,
  eventArenaImage,
]

const filters: Array<{ value: Filter; label: string }> = [
  { value: 'all', label: 'Todos' },
  { value: 'live', label: 'En vivo' },
  { value: 'upcoming', label: 'Próximos' },
  { value: 'finished', label: 'Finalizados' },
]

function Icon({ name }: { name: 'calendar' | 'clock' | 'pin' | 'swords' | 'play' | 'arrow' }) {
  const paths = {
    calendar: <><rect x="3" y="5" width="18" height="16" rx="2" /><path d="M16 3v4M8 3v4M3 10h18" /></>,
    clock: <><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" /></>,
    pin: <><path d="M20 10c0 5-8 11-8 11S4 15 4 10a8 8 0 1 1 16 0Z" /><circle cx="12" cy="10" r="2.5" /></>,
    swords: <><path d="m14.5 17.5 3 3M3 21l6.5-6.5M14 4l6 6M17 3l4 4-9 9-4-4 9-9Z" /><path d="m4 4 7 7M3 3l4 1-3 3-1-4Z" /></>,
    play: <path d="m9 7 8 5-8 5V7Z" />,
    arrow: <><path d="M5 12h14M14 7l5 5-5 5" /></>,
  }

  return (
    <svg className="h-4 w-4 flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      {paths[name]}
    </svg>
  )
}

function StatusPill({ status, large = false }: { status: EventStatus; large?: boolean }) {
  const config = {
    live: { label: 'EN VIVO', classes: 'border-[#D91E24]/40 bg-[#D91E24] text-white', dot: 'bg-white animate-pulse' },
    upcoming: { label: 'PRÓXIMO', classes: 'border-[#E0912A]/40 bg-[#E0912A]/15 text-[#E0912A]', dot: 'bg-[#E0912A]' },
    finished: { label: 'FINALIZADO', classes: 'border-[#555]/60 bg-[#272727]/90 text-[#A3A3A3]', dot: 'bg-[#777]' },
  }[status]

  return (
    <span className={`inline-flex items-center gap-2 rounded-full border font-heading font-black tracking-[0.18em] ${large ? 'px-4 py-2 text-[10px]' : 'px-3 py-1.5 text-[9px]'} ${config.classes}`}>
      <span className={`h-1.5 w-1.5 rounded-full ${config.dot}`} />
      {config.label}
    </span>
  )
}

function PrimaryButton({ children, onClick, icon }: { children: React.ReactNode; onClick?: () => void; icon?: boolean }) {
  return (
    <button onClick={onClick} className="inline-flex items-center justify-center gap-2 rounded-lg bg-[#D91E24] px-6 py-3.5 font-heading text-[11px] font-black uppercase tracking-widest text-white shadow-lg shadow-[#D91E24]/20 transition-all hover:-translate-y-0.5 hover:bg-[#B9151A]">
      {icon && <Icon name="play" />}
      {children}
    </button>
  )
}

function SecondaryButton({ children, onClick }: { children: React.ReactNode; onClick?: () => void }) {
  return (
    <button onClick={onClick} className="inline-flex items-center justify-center gap-2 rounded-lg border border-white/30 bg-black/20 px-6 py-3.5 font-heading text-[11px] font-black uppercase tracking-widest text-white backdrop-blur-sm transition-all hover:border-[#D91E24] hover:bg-[#D91E24]/10">
      {children}
      <Icon name="arrow" />
    </button>
  )
}

function EventCard({ event, onSelect, fights }: { event: EventItem; onSelect: (event: EventItem) => void; fights: PublicFight[] }) {
  const eventFights = fights.filter(fight => fight.eventId === event.id).sort((a, b) => a.number - b.number)
  return (
    <article className="group overflow-hidden rounded-xl border border-[#262626] bg-[#141414] transition-all duration-300 hover:-translate-y-1 hover:border-[#D91E24]/60 hover:shadow-2xl hover:shadow-[#D91E24]/5">
      <div className="relative h-44 overflow-hidden">
        <img src={event.image} alt={`Gallera del evento ${event.name}`} className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#141414] via-black/20 to-black/30" />
        <div className="absolute left-4 top-4"><StatusPill status={event.status} /></div>
        <span className="absolute bottom-3 right-4 font-heading text-[10px] font-bold tracking-widest text-white/80">
          {event.fights} PELEAS
        </span>
      </div>
      <div className="p-5">
        <h3 className="font-heading text-lg font-black uppercase leading-tight text-[#F5F5F5]">{event.name}</h3>
        <div className="mt-4 grid grid-cols-2 gap-3 text-xs text-[#A3A3A3]">
          <span className="flex items-center gap-2"><Icon name="calendar" /> {new Date(`${event.date}T12:00:00`).toLocaleDateString('es-CO', { day: '2-digit', month: 'short' })}</span>
          <span className="flex items-center gap-2"><Icon name="clock" /> {event.time}</span>
          <span className="col-span-2 flex items-center gap-2"><Icon name="pin" /> Gallera {event.arena}</span>
        </div>
        {eventFights.length > 0 && <div className="mt-4 space-y-2 border-t border-[#262626] pt-3">
          <p className="font-heading text-[9px] font-black uppercase tracking-widest text-[#A3A3A3]">Peleas y resultados ({eventFights.length})</p>
          {eventFights.slice(-4).reverse().map(fight => <div key={fight.id} className="text-[11px]">
            <p className="font-semibold text-[#F5F5F5]">#{String(fight.number).padStart(3, '0')} · {fight.roosterA.name} <span className="text-[#D91E24]">VS</span> {fight.roosterB.name}</p>
            {fight.status !== 'finished' && <p className="mt-0.5 text-[10px] font-bold text-[#D99024]">Cuotas: {fight.roosterA.name} x{fight.oddsA.toFixed(2)} · {fight.roosterB.name} x{fight.oddsB.toFixed(2)}</p>}
            <p className={fight.status === 'finished' ? 'mt-0.5 font-bold text-[#53B889]' : 'mt-0.5 text-[#888]'}>{fight.status === 'finished' ? `Ganador oficial: ${fight.winnerRoosterName}` : fight.status === 'live' ? 'En vivo' : 'Programada'}</p>
          </div>)}
          {eventFights.length > 4 && <p className="text-[10px] text-[#888]">Mostrando las últimas 4 peleas.</p>}
        </div>}
        <button onClick={() => onSelect(event)} className="mt-5 flex w-full items-center justify-between border-t border-[#262626] pt-4 font-heading text-[10px] font-black uppercase tracking-[0.18em] text-[#F5F5F5] transition-colors group-hover:text-[#D91E24]">
          Ver evento
          <Icon name="arrow" />
        </button>
      </div>
    </article>
  )
}

export default function Events({ signedInUser, onBack, onGoRoosters, onGoRoosterDirectory, onGoRegisterRooster, onGoAbout, onGoLogin, onGoAdmin, onGoRegister, onGoProfile, onLogout }: EventsProps) {
  const [filter, setFilter] = useState<Filter>('all')
  const [events, setEvents] = useState<EventItem[]>([])
  const [fights, setFights] = useState<PublicFight[]>([])
  const [selectedDay, setSelectedDay] = useState<number | null>(null)
  const [filterDate, setFilterDate] = useState('')
  const [calendarMonth, setCalendarMonth] = useState(() => {
    const now = new Date()
    return new Date(now.getFullYear(), now.getMonth(), 1)
  })
  const [loadError, setLoadError] = useState('')
  const calendarMonthChosen = useRef(false)
  useEffect(() => {
    let active = true
    const refreshEvents = () => Promise.all([
      apiRequest<{ events: Omit<EventItem, 'image'>[] }>('/events'),
      apiRequest<{ fights: PublicFight[] }>('/fights'),
    ])
      .then(([eventData, fightData]) => {
        if (!active) return
        const savedEvents = eventData.events
        setFights(fightData.fights)
        setEvents(savedEvents.map(event => ({ ...event, image: eventArenaImage })))
        setLoadError('')
        setSelectedDay(current => current !== null && !savedEvents.some(event => event.date.startsWith(`${monthKey}-`) && Number(event.date.slice(-2)) === current) ? null : current)
        setFilterDate(current => current && !savedEvents.some(event => event.date === current) ? '' : current)
        if (!calendarMonthChosen.current) {
          const featured = savedEvents.find(event => event.status === 'live') || savedEvents.find(event => event.status === 'upcoming') || savedEvents[0]
          if (featured) {
            const date = new Date(`${featured.date}T12:00:00`)
            setCalendarMonth(new Date(date.getFullYear(), date.getMonth(), 1))
          }
        }
      })
      .catch((error: unknown) => {
        if (active) setLoadError(error instanceof Error ? error.message : 'No se pudo cargar la cartelera.')
      })
    void refreshEvents()
    const interval = window.setInterval(() => { void refreshEvents() }, 3000)
    return () => { active = false; window.clearInterval(interval) }
  }, [])
  const monthStart = new Date(calendarMonth.getFullYear(), calendarMonth.getMonth(), 1)
  const monthKey = `${calendarMonth.getFullYear()}-${String(calendarMonth.getMonth() + 1).padStart(2, '0')}`
  const eventDays = events.filter(event => event.date.startsWith(`${monthKey}-`)).map(event => Number(event.date.slice(-2)))
  const leadingDays = (monthStart.getDay() + 6) % 7
  const monthLength = new Date(calendarMonth.getFullYear(), calendarMonth.getMonth() + 1, 0).getDate()
  const days = Array.from({ length: 42 }, (_, index) => index - leadingDays + 1)
  const monthTitle = calendarMonth.toLocaleDateString('es-CO', { month: 'long', year: 'numeric' })
  const featuredEvent = events.find(event => event.status === 'live') || events[0]

  const visibleEvents = useMemo(() => events.filter(event => {
    const matchesFilter = filter === 'all' || event.status === filter
    const matchesDay = selectedDay === null || (event.date.startsWith(`${monthKey}-`) && Number(event.date.slice(-2)) === selectedDay)
    const matchesDate = !filterDate || event.date === filterDate
    return matchesFilter && matchesDay && matchesDate
  }), [events, filter, selectedDay, filterDate])

  function scrollToSchedule() {
    document.getElementById('cartelera')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  function chooseEvent(event: EventItem) {
    if (event.status === 'live') onBack()
    else {
      const date = new Date(`${event.date}T12:00:00`)
      calendarMonthChosen.current = true
      setCalendarMonth(new Date(date.getFullYear(), date.getMonth(), 1))
      setSelectedDay(date.getDate())
      setFilterDate('')
      document.getElementById('calendario')?.scrollIntoView({ behavior: 'smooth', block: 'center' })
    }
  }

  function formatDate(date: string) {
    return new Date(`${date}T12:00:00`).toLocaleDateString('es-CO', { weekday: 'short', day: '2-digit', month: 'short' })
  }

  return (
    <div className="min-h-screen overflow-x-hidden bg-[#0A0A0A] text-[#F5F5F5] font-body">
      <header className="sticky top-0 z-50 border-b border-[#D91E24]/20 bg-[#0A0A0A]/95 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-[1440px] items-center justify-between gap-4 px-4 sm:px-6">
          <button onClick={onBack} className="group flex flex-shrink-0 items-center gap-2 sm:gap-3">
            <RoosterLogo size={36} />
            <span className="font-heading text-lg font-black tracking-wider text-[#F5F5F5] sm:text-xl">
              GALLER<span className="text-[#D91E24]">APP</span>
            </span>
          </button>

          <nav className="hidden items-center gap-1 md:flex">
            <button onClick={onBack} className="rounded px-4 py-2 font-heading text-xs font-semibold tracking-widest text-[#A3A3A3] transition-colors hover:bg-[#171717] hover:text-white">PELEAS</button>
            <button className="rounded bg-[#171717] px-4 py-2 font-heading text-xs font-semibold tracking-widest text-white">EVENTOS</button>
            <button onClick={onGoRegisterRooster} className="rounded px-4 py-2 font-heading text-xs font-semibold tracking-widest text-[#A3A3A3] transition-colors hover:bg-[#171717] hover:text-white">INSCRIBE TU GALLO</button>
            <button onClick={onGoRoosterDirectory} className="rounded px-4 py-2 font-heading text-xs font-semibold tracking-widest text-[#A3A3A3] transition-colors hover:bg-[#171717] hover:text-white">GALLOS</button>
            <button onClick={onGoAbout} className="rounded px-4 py-2 font-heading text-xs font-semibold tracking-widest text-[#A3A3A3] transition-colors hover:bg-[#171717] hover:text-white">QUIÉNES SOMOS</button>
          </nav>

          <div className="flex flex-shrink-0 items-center gap-2 sm:gap-3">
            {signedInUser ? (
              <>
                <div className="hidden items-center gap-2 rounded border border-[#2A2A2A] bg-[#171717] px-3 py-2 sm:flex">
                  {signedInUser.profileImage ? <img src={signedInUser.profileImage} alt="" className="h-7 w-7 rounded-full object-cover" /> : <span className="flex h-7 w-7 items-center justify-center rounded-full bg-[#D71920] font-heading text-[10px] font-black text-white">{signedInUser.nombre.charAt(0).toUpperCase()}</span>}
                  <span className="max-w-28 truncate font-heading text-xs font-bold text-white">{signedInUser.nombre} {signedInUser.apellido}</span>
                  <span className="rounded bg-[#2A2A2A] px-1.5 py-1 font-heading text-[8px] font-black text-[#A3A3A3]">{signedInUser.role === 'administrador' ? 'ADMIN' : 'USUARIO'}</span>
                </div>
                {signedInUser.role === 'administrador' && <button onClick={onGoAdmin} className="rounded bg-[#D91E24] px-3 py-2 font-heading text-[9px] font-black tracking-wider text-white sm:px-4 sm:text-[10px]">PANEL ADMIN</button>}
                <button onClick={onGoProfile} className="hidden rounded border border-[#2A2A2A] px-3 py-2 font-heading text-[10px] font-bold tracking-wider text-[#A3A3A3] hover:text-white md:block">MI PERFIL</button>
                <button onClick={onLogout} className="rounded border border-[#2A2A2A] px-3 py-2 font-heading text-[10px] font-bold tracking-wider text-[#A3A3A3] hover:text-white">SALIR</button>
              </>
            ) : (
              <>
            <button
              onClick={onGoAdmin}
              className="rounded border border-[#E0912A]/50 bg-[#E0912A]/10 px-2.5 py-2 font-heading text-[9px] font-black tracking-wider text-[#E0912A] transition-all hover:border-[#E0912A] hover:bg-[#E0912A] hover:text-[#0A0A0A] sm:px-4 sm:text-[10px]"
              aria-label="Acceso para administradores"
            >
              ADMIN
            </button>
            <button onClick={onGoLogin} className="hidden rounded border border-[#2A2A2A] px-4 py-2 font-heading text-xs font-bold tracking-widest text-[#A3A3A3] transition-all hover:border-[#555] hover:text-white sm:block">ENTRAR</button>
            <button onClick={onGoRegister} className="rounded bg-[#D91E24] px-3 py-2 font-heading text-[10px] font-bold tracking-widest text-white shadow-lg shadow-[#D91E24]/20 transition-all hover:bg-[#B9151A] sm:px-4 sm:text-xs">REGISTRARSE</button>
              </>
            )}
          </div>
        </div>
        <nav className="flex items-center justify-center gap-1 border-t border-[#1D1D1D] px-3 py-2 md:hidden">
          <button onClick={onBack} className="px-2 py-1 font-heading text-[9px] font-bold tracking-wider text-[#777]">PELEAS</button>
          <button className="rounded bg-[#1C1C1C] px-2 py-1 font-heading text-[9px] font-bold tracking-wider text-white">EVENTOS</button>
          <button onClick={onGoRegisterRooster} className="whitespace-nowrap px-2 py-1 font-heading text-[9px] font-bold tracking-wider text-[#777]">INSCRIBIR</button>
          <button onClick={onGoRoosterDirectory} className="px-2 py-1 font-heading text-[9px] font-bold tracking-wider text-[#777]">GALLOS</button>
          <button onClick={onGoAbout} className="px-2 py-1 font-heading text-[9px] font-bold tracking-wider text-[#777]">NOSOTROS</button>
        </nav>
      </header>

      <main>
        <section className="relative overflow-hidden border-b border-[#262626]">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_82%_12%,rgba(217,30,36,0.22),transparent_38%)]" />
          <div className="relative mx-auto max-w-[1280px] px-5 py-12 sm:px-6 md:py-16">
            <div className="mb-5 flex items-center gap-3">
              <span className="h-px w-10 bg-[#D91E24]" />
              <span className="font-heading text-[10px] font-bold tracking-[0.3em] text-[#D91E24]">CARTELERA OFICIAL</span>
            </div>
            <div className="flex flex-col justify-between gap-7 md:flex-row md:items-end">
              <div>
                <h1 className="font-heading text-4xl font-black uppercase leading-[1.02] tracking-tight md:text-6xl">
                  Próximos <span className="text-[#E0912A]">eventos</span>
                </h1>
                <p className="mt-4 max-w-2xl text-sm leading-7 text-[#A3A3A3] md:text-base">
                  Consulta la cartelera, reserva la fecha y entra en vivo a cada jornada desde la gallera.
                </p>
              </div>
              <div className="flex w-fit items-center gap-3 rounded-full border border-[#176B45]/50 bg-[#176B45]/15 px-5 py-3">
                <span className="h-2 w-2 animate-pulse rounded-full bg-[#53B889]" />
                <span className="font-heading text-[10px] font-black tracking-widest text-[#53B889]">TEMPORADA ACTIVA</span>
              </div>
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-[1280px] px-5 py-8 sm:px-6 md:py-10">
          <article className="relative isolate min-h-[470px] overflow-hidden rounded-xl border border-[#333] bg-[#141414] shadow-2xl shadow-black/40 md:min-h-[430px]">
            <img src={arenaImages[0]} alt="Gallera principal durante el evento destacado" className="absolute inset-0 -z-20 h-full w-full object-cover" />
            <div className="absolute inset-0 -z-10 bg-gradient-to-r from-black via-black/80 to-black/25" />
            <div className="flex min-h-[470px] max-w-3xl flex-col justify-end p-6 md:min-h-[430px] md:justify-center md:p-12">
              <StatusPill status={featuredEvent?.status ?? 'upcoming'} large />
              <p className="mt-6 font-heading text-[10px] font-bold tracking-[0.3em] text-[#E0912A]">EVENTO DESTACADO</p>
              <h2 className="mt-3 font-heading text-3xl font-black uppercase leading-tight md:text-5xl">{featuredEvent?.name ?? 'Proximamente'}</h2>
              <div className="mt-6 flex flex-wrap gap-x-6 gap-y-3 text-sm text-[#C7C7C7]">
                <span className="flex items-center gap-2"><Icon name="calendar" /> {featuredEvent ? formatDate(featuredEvent.date) : 'Fecha por anunciar'}</span>
                <span className="flex items-center gap-2"><Icon name="clock" /> {featuredEvent?.time ?? ''}</span>
                <span className="flex items-center gap-2"><Icon name="pin" /> Gallera {featuredEvent?.arena ?? ''}</span>
                <span className="flex items-center gap-2"><Icon name="swords" /> {featuredEvent?.fights ?? 0} peleas</span>
              </div>
              <p className="mt-5 font-heading text-sm font-bold uppercase tracking-wider text-[#A3A3A3]">
                Bolsa de premios <strong className="ml-2 text-xl font-black text-[#E0912A]">{featuredEvent?.prize ? `$${featuredEvent.prize.toLocaleString('es-CO')}` : 'Por anunciar'}</strong>
              </p>
              <div className="mt-7 flex flex-col gap-3 sm:flex-row">
                <PrimaryButton onClick={onBack} icon>Ver transmisión</PrimaryButton>
                <SecondaryButton onClick={scrollToSchedule}>Ver cartelera</SecondaryButton>
              </div>
            </div>
          </article>
        </section>

        <section id="cartelera" className="mx-auto max-w-[1280px] scroll-mt-28 px-5 pb-16 sm:px-6">
          <div className="flex flex-col gap-5 border-b border-[#262626] pb-6 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex gap-2 overflow-x-auto pb-1">
              {filters.map(item => (
                <button key={item.value} onClick={() => setFilter(item.value)} className={`flex-shrink-0 rounded-full border px-4 py-2 font-heading text-[10px] font-black uppercase tracking-wider transition-all ${filter === item.value ? 'border-[#D91E24] bg-[#D91E24] text-white' : 'border-[#333] bg-[#141414] text-[#888] hover:border-[#D91E24]/60 hover:text-white'}`}>
                  {item.label}
                </button>
              ))}
            </div>
            <label className="flex w-full items-center gap-3 rounded-full border border-[#333] bg-[#141414] px-4 py-2 text-[#888] lg:w-auto">
              <Icon name="calendar" />
              <span className="font-heading text-[9px] font-bold tracking-wider">FECHA</span>
              <input type="date" value={filterDate} onChange={e => { setFilterDate(e.target.value); setSelectedDay(null) }} className="min-w-0 flex-1 bg-transparent text-xs text-[#D0D0D0] outline-none [color-scheme:dark]" />
            </label>
          </div>

          <div className="mt-8 flex items-end justify-between gap-5">
            <div>
              <span className="font-heading text-[10px] font-bold tracking-[0.3em] text-[#D91E24]">AGENDA DE {monthTitle}</span>
              <h2 className="mt-3 font-heading text-2xl font-black uppercase md:text-3xl">Toda la cartelera</h2>
            </div>
            <span className="hidden text-xs text-[#666] sm:block">{visibleEvents.length} eventos</span>
          </div>

          {loadError && <p role="alert" className="mt-5 rounded-lg border border-[#D91E24]/40 bg-[#D91E24]/10 p-3 text-sm text-[#F5A0A3]">{loadError}</p>}
          {visibleEvents.length > 0 ? (
            <div className="mt-7 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
              {visibleEvents.map(event => <EventCard key={event.id} event={event} onSelect={chooseEvent} fights={fights} />)}
            </div>
          ) : (
            <div className="mt-7 rounded-xl border border-dashed border-[#333] bg-[#141414] px-6 py-14 text-center">
              <p className="font-heading text-sm font-black uppercase">No hay eventos para esta selección</p>
              <button onClick={() => { setFilter('all'); setSelectedDay(null); setFilterDate('') }} className="mt-3 text-xs font-semibold text-[#D91E24]">Ver todos los eventos</button>
            </div>
          )}
        </section>

        <section id="calendario" className="border-y border-[#262626] bg-[#101010] px-5 py-16 sm:px-6">
          <div className="mx-auto grid max-w-[1280px] gap-8 lg:grid-cols-[0.72fr_1.28fr] lg:items-center">
            <div>
              <span className="font-heading text-[10px] font-bold tracking-[0.3em] text-[#D91E24]">PLANIFICA TU MES</span>
              <h2 className="mt-4 font-heading text-3xl font-black uppercase md:text-4xl">Calendario de eventos</h2>
              <p className="mt-4 max-w-md text-sm leading-7 text-[#A3A3A3]">
                Los días marcados tienen cartelera confirmada. Selecciona una fecha para consultar sus eventos.
              </p>
              {selectedDay && (
                <button onClick={() => setSelectedDay(null)} className="mt-6 font-heading text-[10px] font-black uppercase tracking-widest text-[#D91E24]">
                  Limpiar selección del día {selectedDay}
                </button>
              )}
            </div>

            <div className="rounded-xl border border-[#262626] bg-[#141414] p-4 sm:p-7">
              <div className="mb-6 flex items-center justify-between">
                <div className="flex items-center gap-3"><button aria-label="Mes anterior" onClick={() => { calendarMonthChosen.current = true; setCalendarMonth(new Date(calendarMonth.getFullYear(), calendarMonth.getMonth() - 1, 1)) }} className="rounded border border-[#333] px-2 py-1 text-sm text-white">‹</button><strong className="font-heading text-lg font-black uppercase">{monthTitle}</strong><button aria-label="Mes siguiente" onClick={() => { calendarMonthChosen.current = true; setCalendarMonth(new Date(calendarMonth.getFullYear(), calendarMonth.getMonth() + 1, 1)) }} className="rounded border border-[#333] px-2 py-1 text-sm text-white">›</button></div>
                <span className="rounded-full bg-[#D91E24]/10 px-3 py-1.5 font-heading text-[9px] font-bold tracking-widest text-[#D91E24]">{eventDays.length} EVENTOS</span>
              </div>
              <div className="grid grid-cols-7 gap-1 text-center">
                {['L', 'M', 'M', 'J', 'V', 'S', 'D'].map((day, index) => (
                  <span key={`${day}-${index}`} className="py-2 font-heading text-[9px] font-bold text-[#666]">{day}</span>
                ))}
                {days.map((day, index) => {
                  const hasEvent = day > 0 && day <= monthLength && eventDays.includes(day)
                  return (
                    <button key={index} disabled={day < 1 || day > monthLength} onClick={() => { if (hasEvent) { setSelectedDay(day); setFilterDate('') } }} className={`relative flex aspect-square items-center justify-center rounded-lg text-xs transition-all sm:text-sm ${day < 1 || day > monthLength ? 'text-transparent' : hasEvent ? selectedDay === day ? 'bg-[#D91E24] font-bold text-white shadow-lg shadow-[#D91E24]/20' : 'bg-[#D91E24]/12 font-bold text-[#F5F5F5] hover:bg-[#D91E24]' : 'text-[#888] hover:bg-[#222] hover:text-white'}`}>
                      {day > 0 && day <= monthLength ? day : ''}
                      {hasEvent && selectedDay !== day && <span className="absolute bottom-1 h-1 w-1 rounded-full bg-[#D91E24]" />}
                    </button>
                  )
                })}
              </div>
            </div>
          </div>
        </section>

        <section className="px-5 py-16 sm:px-6">
          <div className="relative mx-auto flex max-w-[1280px] flex-col items-start justify-between gap-7 overflow-hidden rounded-xl border border-[#D91E24]/40 bg-[#141414] p-7 md:flex-row md:items-center md:p-10">
            <div className="absolute -right-20 -top-24 h-64 w-64 rounded-full bg-[#D91E24]/15 blur-3xl" />
            <div className="relative">
              <span className="font-heading text-[10px] font-bold tracking-[0.3em] text-[#E0912A]">ENTRA AL RUEDO</span>
              <h2 className="mt-3 font-heading text-2xl font-black uppercase md:text-4xl">¿Quieres competir? <span className="text-[#E0912A]">Inscribe tu gallo</span></h2>
              <p className="mt-3 max-w-2xl text-sm leading-6 text-[#A3A3A3]">Registra tu competidor y prepáralo para las próximas jornadas oficiales.</p>
            </div>
            <div className="relative w-full flex-shrink-0 md:w-auto">
              <PrimaryButton onClick={onGoRoosters}>Inscribir mi gallo</PrimaryButton>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-[#1F1F1F] px-5 py-7 sm:px-6">
        <div className="mx-auto flex max-w-[1280px] flex-col items-center justify-between gap-4 text-center sm:flex-row sm:text-left">
          <button onClick={onBack} className="flex items-center gap-3">
            <RoosterLogo size={24} />
            <span className="font-heading text-sm font-black tracking-wider text-[#A3A3A3]">GALLER<span className="text-[#D91E24]">APP</span></span>
          </button>
          <p className="font-heading text-[9px] tracking-[0.16em] text-[#666]">
            © 2026 GallerApp · SOLO MAYORES DE 18 AÑOS · JUEGA CON RESPONSABILIDAD
          </p>
        </div>
      </footer>
    </div>
  )
}
