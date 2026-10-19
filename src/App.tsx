import { useState, useRef, useEffect, type FormEvent } from 'react'
import Login from './pages/Login'
import Register from './pages/Register'
import About from './pages/About'
import Roosters from './pages/Roosters'
import RoosterDirectory from './pages/RoosterDirectory'
import Events from './pages/Events'
import AdminPanel from './pages/AdminPanel'
import Profile from './pages/Profile'
import { RoosterLogo } from './components/RoosterLogo'
import { apiRequest, type GallerUser } from './lib/api'

type EventStatus = 'live' | 'upcoming' | 'finished'
interface HomeEvent { id: string; name: string; date: string; time: string; arena: string; fights: number; status: EventStatus; prize: number }
type FightStatus = 'upcoming' | 'live' | 'finished'
interface HomeFight { id: string; number: number; eventId: string; eventName: string; eventDate: string; eventTime: string; eventArena: string; roosterA: { id: string; name: string; code: string; image?: string }; roosterB: { id: string; name: string; code: string; image?: string }; oddsA: number; oddsB: number; status: FightStatus; winnerRoosterId: string | null; winnerRoosterName: string | null }
interface UserBet { id: string; fightId: string; fightNumber: number; roosterId: string; roosterName: string; amount: number; multiplier: number; potentialPayout: number; status: 'pending' | 'won' | 'lost'; paidOut?: number }

function eventStatusLabel(status: EventStatus) {
  return status === 'live' ? 'live' : status === 'upcoming' ? 'proxima' : 'finalizada'
}

function fightStatusLabel(status: FightStatus) {
  return status === 'live' ? 'live' : status === 'upcoming' ? 'proxima' : 'finalizada'
}

function formatEventDate(date: string) {
  return new Date(`${date}T12:00:00`).toLocaleDateString('es-CO', { day: '2-digit', month: 'short', year: 'numeric' })
}

function formatCOP(amount: number) {
  return `$${new Intl.NumberFormat('es-CO', { maximumFractionDigits: 0 }).format(amount)}`
}

const chatMessages = [
  { id: 1, user: 'CarlosVP', msg: '¡Vamos Obsidiana! El favorito de esta noche 🔥', time: '8:28' },
  { id: 2, user: 'MarisolR', msg: 'Las cuotas de Sangre Real están muy buenas', time: '8:29' },
  { id: 3, user: 'DiegoF88', msg: 'Aposte $100,000 a Obsidiana, confiado', time: '8:30' },
  { id: 4, user: 'Ana_Cock', msg: '¡Qué pelea más reñida, no hay favorito claro!', time: '8:30' },
  { id: 5, user: 'JuanGO', msg: 'Sangre Real viene de ganar 4 seguidas', time: '8:31' },
  { id: 6, user: 'Pedro_G', msg: 'La transmisión está perfecta hoy 👌', time: '8:31' },
  { id: 7, user: 'LuisaM', msg: 'Primera vez aquí, impresionante la plataforma', time: '8:32' },
]

// --- ICON COMPONENTS ---
function IconLive() {
  return (
    <span className="flex items-center gap-1.5">
      <span className="relative flex h-2 w-2">
        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#D71920] opacity-75" />
        <span className="relative inline-flex rounded-full h-2 w-2 bg-[#D71920]" />
      </span>
      <span className="text-[#D71920] text-xs font-bold tracking-widest font-heading">EN VIVO</span>
    </span>
  )
}

function IconSend() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="22" y1="2" x2="11" y2="13" />
      <polygon points="22 2 15 22 11 13 2 9 22 2" />
    </svg>
  )
}

function IconFullscreen() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="15 3 21 3 21 9" /><polyline points="9 21 3 21 3 15" />
      <line x1="21" y1="3" x2="14" y2="10" /><line x1="3" y1="21" x2="10" y2="14" />
    </svg>
  )
}

function IconPlay() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
      <polygon points="5 3 19 12 5 21 5 3" />
    </svg>
  )
}

function IconVolume() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
      <path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07" />
    </svg>
  )
}


// --- STATUS BADGE ---
function StatusBadge({ status }: { status: string }) {
  if (status === 'live') return (
    <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#D71920]/15 border border-[#D71920]/30">
      <span className="w-1.5 h-1.5 rounded-full bg-[#D71920] animate-pulse" />
      <span className="text-[#D71920] text-xs font-bold tracking-widest font-heading">EN VIVO</span>
    </span>
  )
  if (status === 'proxima') return (
    <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#D99024]/10 border border-[#D99024]/30">
      <span className="w-1.5 h-1.5 rounded-full bg-[#D99024]" />
      <span className="text-[#D99024] text-xs font-bold tracking-widest font-heading">PRÓXIMA</span>
    </span>
  )
  return (
    <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#2A2A2A] border border-[#333]">
      <span className="w-1.5 h-1.5 rounded-full bg-[#A3A3A3]" />
      <span className="text-[#A3A3A3] text-xs font-bold tracking-widest font-heading">FINALIZADA</span>
    </span>
  )
}

// --- MAIN APP ---
export default function App() {
  const [view, setView] = useState<'home' | 'login' | 'register' | 'about' | 'roosters' | 'rooster-directory' | 'events' | 'admin' | 'profile'>('home')
  const [chatInput, setChatInput] = useState('')
  const [messages, setMessages] = useState(chatMessages)
  const [betSelected, setBetSelected] = useState<null | 'a' | 'b'>(null)
  const [betAmount, setBetAmount] = useState('5000')
  const [myBets, setMyBets] = useState<UserBet[]>([])
  const [betError, setBetError] = useState('')
  const [betNotice, setBetNotice] = useState('')
  const [betSaving, setBetSaving] = useState(false)
  const [isPlaying, setIsPlaying] = useState(true)
  const [volume, setVolume] = useState(80)
  const chatEndRef = useRef<HTMLDivElement>(null)
  const [mobileMenu, setMobileMenu] = useState(false)
  const [signedInUser, setSignedInUser] = useState<GallerUser | null>(null)
  const [events, setEvents] = useState<HomeEvent[]>([])
  const [fights, setFights] = useState<HomeFight[]>([])
  const [eventsError, setEventsError] = useState('')

  useEffect(() => {
    if (view !== 'home') return
    let active = true
    const refreshEvents = () => Promise.all([
      apiRequest<{ events: HomeEvent[] }>('/events'),
      apiRequest<{ fights: HomeFight[] }>('/fights'),
    ])
      .then(([eventData, fightData]) => { if (active) { setEvents(eventData.events); setFights(fightData.fights); setEventsError('') } })
      .catch((error: Error) => { if (active) setEventsError(error.message) })
    void refreshEvents()
    const interval = window.setInterval(() => { void refreshEvents() }, 3000)
    return () => { active = false; window.clearInterval(interval) }
  }, [view])

  const featuredFight = fights.find(fight => fight.status === 'live')
    || fights.find(fight => fight.status === 'upcoming')
    || [...fights].reverse().find(fight => fight.status === 'finished')
  const selectedBetOdds = featuredFight ? (betSelected === 'a' ? featuredFight.oddsA : betSelected === 'b' ? featuredFight.oddsB : 0) : 0
  const featuredEvent = (featuredFight && events.find(event => event.id === featuredFight.eventId))
    || events.find(event => event.status === 'live')
    || events.find(event => event.status === 'upcoming')
    || events[0]
  const scheduledEvents = [...events].sort((a, b) => `${a.date} ${a.time}`.localeCompare(`${b.date} ${b.time}`))
  const orderedFights = [...fights].sort((a, b) => {
    const rank: Record<FightStatus, number> = { live: 0, upcoming: 1, finished: 2 }
    return rank[a.status] - rank[b.status] || b.number - a.number
  })

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  useEffect(() => {
    if (sessionStorage.getItem('gallerapp_token')) {
      apiRequest<{ user: GallerUser }>('/auth/me')
        .then(({ user }) => setSignedInUser(user))
        .catch(() => sessionStorage.removeItem('gallerapp_token'))
    }
  }, [])

  useEffect(() => {
    if (!signedInUser?.id) return
    let active = true
    apiRequest<{ profile: GallerUser }>('/auth/profile')
      .then(({ profile }) => { if (active) setSignedInUser(current => current?.id === profile.id ? { ...current, ...profile } : current) })
      .catch(() => {})
    return () => { active = false }
  }, [signedInUser?.id])

  useEffect(() => {
    if (!signedInUser || view !== 'home') { setMyBets([]); return }
    let active = true
    const refreshAccount = () => Promise.all([
      apiRequest<{ bets: UserBet[] }>('/bets/me'),
      apiRequest<{ user: GallerUser }>('/auth/me'),
    ]).then(([betData, account]) => {
      if (active) { setMyBets(betData.bets); setSignedInUser(current => ({ ...account.user, profileImage: current?.profileImage })) }
    }).catch(() => {})
    void refreshAccount()
    const interval = window.setInterval(() => { void refreshAccount() }, 3000)
    return () => { active = false; window.clearInterval(interval) }
  }, [signedInUser?.id, view])

  if (view === 'profile') return signedInUser
    ? <Profile user={signedInUser} onBack={() => setView('home')} onUpdated={setSignedInUser} />
    : <main className="min-h-screen bg-[#0B0B0B] p-10 text-center text-white">Inicia sesión para ver tu perfil. <button className="ml-2 underline" onClick={() => setView('login')}>Entrar</button></main>

  if (view === 'login') return <Login onBack={() => setView('home')} onGoRegister={() => setView('register')} onSuccess={(user) => { setSignedInUser(user); setView('home') }} />
  if (view === 'register') return <Register onBack={() => setView('home')} onGoLogin={() => setView('login')} />
  if (view === 'admin') return signedInUser?.role === 'administrador' ? <AdminPanel onBack={() => setView('home')} /> : <main className="min-h-screen bg-[#0B0B0B] p-10 text-center text-white">Acceso restringido. <button className="ml-2 underline" onClick={() => setView('home')}>Volver</button></main>
  if (view === 'about') {
    return (
      <About
        signedInUser={signedInUser}
        onBack={() => setView('home')}
        onGoEvents={() => setView('events')}
        onGoRoosters={() => setView('roosters')}
        onGoRegisterRooster={() => setView('roosters')}
        onGoRoosterDirectory={() => setView('rooster-directory')}
        onGoAdmin={() => setView(signedInUser?.role === 'administrador' ? 'admin' : 'login')}
        onGoLogin={() => setView('login')}
        onGoRegister={() => setView('register')}
        onGoProfile={() => setView('profile')}
        onLogout={() => { sessionStorage.removeItem('gallerapp_token'); setSignedInUser(null) }}
      />
    )
  }
  if (view === 'roosters') {
    return (
      <Roosters
        signedInUser={signedInUser}
        onBack={() => setView('home')}
        onGoEvents={() => setView('events')}
        onGoRoosterDirectory={() => setView('rooster-directory')}
        onGoAbout={() => setView('about')}
        onGoAdmin={() => setView(signedInUser?.role === 'administrador' ? 'admin' : 'login')}
        onGoLogin={() => setView('login')}
        onGoRegister={() => setView('register')}
        onGoProfile={() => setView('profile')}
        onLogout={() => { sessionStorage.removeItem('gallerapp_token'); setSignedInUser(null) }}
      />
    )
  }
  if (view === 'rooster-directory') {
    return (
      <RoosterDirectory
        signedInUser={signedInUser}
        onBack={() => setView('home')}
        onGoEvents={() => setView('events')}
        onGoRegisterRooster={() => setView('roosters')}
        onGoAbout={() => setView('about')}
        onGoAdmin={() => setView(signedInUser?.role === 'administrador' ? 'admin' : 'login')}
        onGoLogin={() => setView('login')}
        onGoRegister={() => setView('register')}
        onGoProfile={() => setView('profile')}
        onLogout={() => { sessionStorage.removeItem('gallerapp_token'); setSignedInUser(null) }}
        isAdmin={signedInUser?.role === 'administrador'}
      />
    )
  }
  if (view === 'events') {
    return (
      <Events
        signedInUser={signedInUser}
        onBack={() => setView('home')}
        onGoRoosters={() => setView('rooster-directory')}
        onGoRoosterDirectory={() => setView('rooster-directory')}
        onGoRegisterRooster={() => setView('roosters')}
        onGoAbout={() => setView('about')}
        onGoAdmin={() => setView(signedInUser?.role === 'administrador' ? 'admin' : 'login')}
        onGoLogin={() => setView('login')}
        onGoRegister={() => setView('register')}
        onGoProfile={() => setView('profile')}
        onLogout={() => { sessionStorage.removeItem('gallerapp_token'); setSignedInUser(null) }}
      />
    )
  }

  function sendMessage() {
    if (!chatInput.trim()) return
    setMessages(prev => [...prev, {
      id: prev.length + 1,
      user: 'Tú',
      msg: chatInput.trim(),
      time: new Date().toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' }),
    }])
    setChatInput('')
  }

  async function placeBet(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!featuredFight || !signedInUser || !betSelected) { setBetError('Selecciona uno de los gallos para continuar.'); return }
    setBetSaving(true)
    setBetError('')
    setBetNotice('')
    try {
      const roosterId = betSelected === 'a' ? featuredFight.roosterA.id : featuredFight.roosterB.id
      const result = await apiRequest<{ bet: UserBet; user: GallerUser }>('/bets', { fightId: featuredFight.id, roosterId, amount: Number(betAmount) }, 'POST')
      setSignedInUser(result.user)
      setMyBets(previous => [...previous.filter(bet => bet.id !== result.bet.id), result.bet])
      setBetNotice(`Apuesta registrada por ${result.bet.roosterName}.`)
      setBetSelected(null)
    } catch (error) {
      setBetError(error instanceof Error ? error.message : 'No se pudo registrar la apuesta.')
    } finally { setBetSaving(false) }
  }

  return (
    <div className="min-h-screen bg-[#0B0B0B] text-[#F5F5F5] font-body overflow-x-hidden">

      {/* ─── HEADER ─── */}
      <header className="sticky top-0 z-50 bg-[#0B0B0B] border-b border-[#D71920]/20 backdrop-blur-sm">
        <div className="max-w-[1440px] mx-auto px-6 h-16 flex items-center justify-between gap-6">

          {/* Logo */}
          <div className="flex items-center gap-3 flex-shrink-0">
            <RoosterLogo size={38} />
            <span className="font-heading font-black text-xl tracking-wider text-[#F5F5F5]">
              GALLER<span className="text-[#D71920]">APP</span>
            </span>
          </div>

          {/* Nav */}
          <nav className="hidden md:flex items-center gap-1">
            {['PELEAS', 'EVENTOS', 'INSCRIBE TU GALLO', 'GALLOS', 'QUIÉNES SOMOS'].map((item, i) => (
              <button key={item} onClick={() => {
                if (item === 'QUIÉNES SOMOS') setView('about')
                if (item === 'INSCRIBE TU GALLO') setView('roosters')
                if (item === 'GALLOS') setView('rooster-directory')
                if (item === 'EVENTOS') setView('events')
              }}
                className={`px-4 py-2 text-xs font-heading font-semibold tracking-widest transition-colors duration-200 rounded
                  ${i === 0 ? 'text-[#F5F5F5] bg-[#171717]' : 'text-[#A3A3A3] hover:text-[#F5F5F5] hover:bg-[#171717]'}`}>
                {item}
              </button>
            ))}
          </nav>

          {/* Actions */}
          <div className="flex items-center gap-3 flex-shrink-0">
            {signedInUser ? (
              <>
                <div className="flex items-center gap-2 px-3 py-1.5 rounded bg-[#171717] border border-[#2A2A2A]">
                  <div className="w-6 h-6 overflow-hidden rounded-full bg-gradient-to-br from-[#D71920] to-[#A01218] flex items-center justify-center text-[10px] font-bold font-heading">{signedInUser.profileImage ? <img src={signedInUser.profileImage} alt="" className="h-full w-full object-cover" /> : signedInUser.nombre.slice(0, 1).toUpperCase()}</div>
                  <span className="text-[#F5F5F5] text-sm font-semibold font-heading">{signedInUser.nombre}</span>
                  <span className={`rounded px-1.5 py-0.5 text-[9px] font-bold tracking-wider ${signedInUser.role === 'administrador' ? 'bg-[#D71920]/20 text-[#F58A8E]' : 'bg-[#2A2A2A] text-[#A3A3A3]'}`}>{signedInUser.role === 'administrador' ? 'ADMIN' : 'USUARIO'}</span>
                </div>
                <button onClick={() => setView('profile')} className="px-3 py-2 text-xs font-heading font-bold tracking-widest text-[#A3A3A3] hover:text-[#F5F5F5] border border-[#2A2A2A] rounded transition-all hover:border-[#444]">MI PERFIL</button>
                {signedInUser.role === 'administrador' && <button onClick={() => setView('admin')} className="px-3 py-2 text-xs font-heading font-bold tracking-widest text-[#F5F5F5] bg-[#D71920] hover:bg-[#A01218] rounded">PANEL ADMIN</button>}
                <button onClick={() => { sessionStorage.removeItem('gallerapp_token'); setSignedInUser(null) }} className="px-3 py-2 text-xs font-heading font-bold tracking-widest text-[#A3A3A3] hover:text-[#F5F5F5] border border-[#2A2A2A] rounded transition-all hover:border-[#444]">
                  SALIR
                </button>
              </>
            ) : (
              <>
                <button onClick={() => setView('login')} className="hidden md:block px-4 py-2 text-xs font-heading font-bold tracking-widest text-[#A3A3A3] hover:text-[#F5F5F5] border border-[#2A2A2A] rounded transition-all hover:border-[#444]">
                  ENTRAR
                </button>
                <button onClick={() => setView('register')} className="px-4 py-2 text-xs font-heading font-bold tracking-widest text-[#F5F5F5] bg-[#D71920] hover:bg-[#A01218] rounded transition-all duration-200 shadow-lg shadow-[#D71920]/20">
                  REGISTRARSE
                </button>
              </>
            )}
          </div>
        </div>
      </header>

      {/* ─── MAIN CONTENT ─── */}
      <main className="max-w-[1440px] mx-auto px-6 py-6">

        {/* ─── LIVE SECTION: Player + Betting ─── */}
        <div className="flex gap-5 mb-5" style={{ minHeight: '480px' }}>

          {/* VIDEO PLAYER — 65% */}
          <div className="flex-1 min-w-0 flex flex-col">
            <div className="relative rounded-xl overflow-hidden bg-[#0F0F0F] border border-[#2A2A2A] shadow-2xl shadow-black/60 flex flex-col" style={{ height: '460px' }}>

              {/* Video area */}
              <div className="relative flex-1 bg-[#080808] overflow-hidden cursor-pointer" onClick={() => setIsPlaying(p => !p)}>
                {/* Mock video — arena image */}
                <img
                  src="https://images.unsplash.com/photo-1547036967-23d11aacaee0?w=1200&h=650&fit=crop&auto=format"
                  alt="Transmisión en vivo de pelea de gallos"
                  className="w-full h-full object-cover opacity-80"
                />

                {/* Dark overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/30" />

                {/* Top bar */}
                <div className="absolute top-0 left-0 right-0 flex items-start justify-between p-4">
                  <div className="flex flex-col gap-2">
                    {featuredFight?.status === 'live' ? <IconLive /> : <span className="text-[#D99024] text-xs font-bold tracking-widest font-heading">{featuredFight ? (featuredFight.status === 'finished' ? 'RESULTADO OFICIAL' : 'PRÓXIMA PELEA') : featuredEvent ? 'EVENTO DESTACADO' : 'SIN EVENTOS'}</span>}
                    <div>
                      <p className="text-[#A3A3A3] text-[10px] font-heading font-semibold tracking-widest">{featuredFight?.eventName ?? featuredEvent?.name ?? 'No hay eventos publicados'}</p>
                      <p className="text-[#F5F5F5] text-sm font-heading font-bold tracking-wide">{featuredFight ? `PELEA #${String(featuredFight.number).padStart(3, '0')}` : featuredEvent ? `${featuredEvent.fights} PELEAS` : 'Consulta la cartelera'}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="px-3 py-1.5 rounded-full bg-black/60 border border-[#D99024]/40 backdrop-blur-sm">
                      <span className="text-[#D99024] text-xs font-heading font-bold">👁 2,847 viendo</span>
                    </div>
                  </div>
                </div>

                {/* Fight details from the admin-managed schedule */}
                <div className="absolute bottom-14 left-0 right-0 flex items-end justify-between px-6 pb-2">
                  <div className="flex flex-col gap-1">
                    <span className="text-[10px] font-heading font-semibold tracking-widest text-[#A3A3A3]">GALLO A · {featuredFight?.roosterA.code ?? 'PARTICIPANTE'}</span>
                    <span className="text-xl font-heading font-black tracking-wide text-[#F5F5F5] drop-shadow-lg">{featuredFight?.roosterA.name ?? 'Sin pelea programada'}</span>
                    {featuredFight?.status === 'finished' && featuredFight.winnerRoosterId === featuredFight.roosterA.id && <span className="text-xs font-heading font-black tracking-widest text-[#72D1A4]">GANADOR OFICIAL</span>}
                  </div>
                  <div className="flex flex-col items-center gap-1">
                    <div className="w-px h-8 bg-[#D71920]/60" />
                    <span className="text-[#D71920] text-xs font-heading font-black tracking-widest px-2 py-0.5 border border-[#D71920]/40 rounded">VS</span>
                    <div className="w-px h-8 bg-[#D71920]/60" />
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    <span className="text-[10px] font-heading font-semibold tracking-widest text-[#A3A3A3]">GALLO B · {featuredFight?.roosterB.code ?? 'PARTICIPANTE'}</span>
                    <span className="text-xl font-heading font-black tracking-wide text-[#F5F5F5] drop-shadow-lg">{featuredFight?.roosterB.name ?? 'Pendiente de asignar'}</span>
                    {featuredFight?.status === 'finished' && featuredFight.winnerRoosterId === featuredFight.roosterB.id && <span className="text-xs font-heading font-black tracking-widest text-[#72D1A4]">GANADOR OFICIAL</span>}
                  </div>
                </div>

                {/* Play/pause overlay */}
                {!isPlaying && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black/40">
                    <div className="w-16 h-16 rounded-full bg-[#D71920]/90 flex items-center justify-center shadow-xl shadow-[#D71920]/30">
                      <IconPlay />
                    </div>
                  </div>
                )}
              </div>

              {/* Controls */}
              <div className="flex items-center gap-4 px-4 py-3 bg-[#0F0F0F] border-t border-[#1F1F1F]">
                <button onClick={() => setIsPlaying(p => !p)}
                  className="text-[#F5F5F5] hover:text-[#D71920] transition-colors">
                  <IconPlay />
                </button>
                <div className="flex items-center gap-2 text-[#A3A3A3]">
                  <IconVolume />
                  <input type="range" min={0} max={100} value={volume}
                    onChange={e => setVolume(Number(e.target.value))}
                    className="w-20 h-1 accent-[#D71920] cursor-pointer" />
                </div>
                <div className="flex-1 flex items-center gap-2">
                  <div className="flex-1 h-1 rounded-full bg-[#2A2A2A] relative">
                    <div className="absolute left-0 top-0 h-full w-[62%] rounded-full bg-[#D71920]" />
                    <div className="absolute h-3 w-3 rounded-full bg-[#F5F5F5] border-2 border-[#D71920] shadow-md" style={{ left: '62%', top: '-4px', transform: 'translateX(-50%)' }} />
                  </div>
                  <span className="text-[#A3A3A3] text-xs font-mono">14:32</span>
                </div>
                <div className="flex items-center gap-3 ml-auto">
                  <button className="text-xs font-heading font-bold text-[#A3A3A3] hover:text-[#F5F5F5] transition-colors tracking-wider">HD</button>
                  <button className="text-[#A3A3A3] hover:text-[#F5F5F5] transition-colors"><IconFullscreen /></button>
                </div>
              </div>
            </div>
          </div>

          {/* OFFICIAL RESULT PANEL */}
          <div className="w-72 xl:w-80 flex-shrink-0 flex flex-col gap-3">
            <div className="flex items-center justify-between px-4 py-3 bg-[#171717] rounded-xl border border-[#2A2A2A]">
              <div className="flex items-center gap-2"><span className={`w-2 h-2 rounded-full ${featuredFight?.status === 'live' ? 'bg-[#D71920] animate-pulse' : 'bg-[#176B45]'}`} /><span className="font-heading font-black text-sm tracking-widest text-[#F5F5F5]">{featuredFight?.status === 'finished' ? 'RESULTADO OFICIAL' : 'PELEA DESTACADA'}</span></div>
              <span className="text-[10px] font-heading text-[#A3A3A3] tracking-wider">{featuredFight ? `#${String(featuredFight.number).padStart(3, '0')}` : 'CARTELERA'}</span>
            </div>
            {featuredFight ? <>
              {[featuredFight.roosterA, featuredFight.roosterB].map((rooster, index) => {
                const winner = featuredFight.status === 'finished' && featuredFight.winnerRoosterId === rooster.id
                return <div key={rooster.id} className={`p-4 rounded-xl bg-[#171717] border ${winner ? 'border-[#176B45] shadow-lg shadow-[#176B45]/10' : 'border-[#2A2A2A]'}`}>
                  <p className="text-[10px] font-heading font-semibold tracking-widest text-[#A3A3A3] mb-1">GALLO {index === 0 ? 'A' : 'B'}</p>
                  <div className="flex items-center justify-between gap-2"><p className="text-base font-heading font-black tracking-wide text-[#F5F5F5]">{rooster.name}</p>{winner && <span className="rounded bg-[#176B45]/20 px-2 py-1 text-[9px] font-black tracking-wider text-[#72D1A4]">GANADOR</span>}</div>
                  {featuredFight.status !== 'finished' && <p className="mt-2 text-xs font-black text-[#D99024]">CUOTA x{(index === 0 ? featuredFight.oddsA : featuredFight.oddsB).toFixed(2)}</p>}
                  {featuredFight.status === 'finished' && <p className={`mt-2 text-xs font-bold ${winner ? 'text-[#72D1A4]' : 'text-[#A3A3A3]'}`}>{winner ? 'Ganador oficial' : 'Finalista'}</p>}
                </div>
              })}
              <div className="p-4 rounded-xl bg-[#171717] border border-[#2A2A2A]">
                <p className="text-[10px] font-heading font-semibold tracking-widest text-[#A3A3A3] mb-1">EVENTO</p>
                <p className="font-heading font-bold text-sm text-white">{featuredFight.eventName}</p>
                <p className="mt-1 text-xs text-[#A3A3A3]">{formatEventDate(featuredFight.eventDate)} · {featuredFight.eventTime} · {featuredFight.eventArena}</p>
                {featuredFight.status === 'finished' && <p className="mt-3 text-sm font-black text-[#72D1A4]">Ganador: {featuredFight.winnerRoosterName}</p>}
              </div>
              {signedInUser?.role === 'usuario' && featuredFight.status !== 'finished' && (() => {
                const existingBet = myBets.find(bet => bet.fightId === featuredFight.id)
                return existingBet ? <div className="p-4 rounded-xl bg-[#171717] border border-[#D99024]/40">
                  <p className="text-[10px] font-heading font-black tracking-widest text-[#D99024]">TU APUESTA · PELEA #{String(featuredFight.number).padStart(3, '0')}</p>
                  <p className="mt-2 text-sm font-bold text-white">{existingBet.roosterName} · {formatCOP(existingBet.amount)}</p>
                  <p className="mt-1 text-xs text-[#A3A3A3]">Cuota x{existingBet.multiplier.toFixed(2)} · retorno total: {formatCOP(existingBet.potentialPayout)} si gana</p>
                </div> : <form onSubmit={placeBet} className="p-4 rounded-xl bg-[#171717] border border-[#2A2A2A]">
                  <p className="text-[10px] font-heading font-black tracking-widest text-[#F5F5F5]">APUESTA POR UN GALLO</p>
                  <p className="mt-1 text-[10px] text-[#888]">Saldo virtual · mínimo {formatCOP(1000)}</p>
                  <div className="mt-3 grid grid-cols-2 gap-2">
                    {[featuredFight.roosterA, featuredFight.roosterB].map((rooster, index) => {
                      const side = index === 0 ? 'a' : 'b'
                      const selected = betSelected === side
                      return <button key={rooster.id} type="button" onClick={() => { setBetSelected(side); setBetError(''); setBetNotice('') }} aria-pressed={selected} className={`rounded-lg border px-2 py-2 text-left transition-colors ${selected ? 'border-[#D71920] bg-[#D71920]/15' : 'border-[#333] bg-[#0F0F0F] hover:border-[#666]'}`}>
                        <span className="block text-[9px] font-black tracking-widest text-[#888]">GALLO {index === 0 ? 'A' : 'B'}</span>
                        <span className="mt-1 block truncate text-xs font-bold text-white">{rooster.name}</span>
                      </button>
                    })}
                  </div>
                  <label className="mt-3 block text-[9px] font-bold tracking-widest text-[#A3A3A3]">MONTO
                    <input type="number" min="1000" step="1000" max={signedInUser.saldo ?? 0} required value={betAmount} onChange={event => setBetAmount(event.target.value)} className="mt-1 w-full rounded-lg border border-[#333] bg-[#0F0F0F] px-3 py-2 text-sm text-white outline-none focus:border-[#D71920]" />
                  </label>
                  <p className="mt-2 text-[10px] text-[#888]">{selectedBetOdds ? `Cuota x${selectedBetOdds.toFixed(2)} · ` : ''}Retorno total potencial: {formatCOP(Math.round(Math.max(0, Number(betAmount) || 0) * selectedBetOdds))}</p>
                  {betError && <p role="alert" className="mt-2 text-xs text-[#F58A8E]">{betError}</p>}
                  {betNotice && <p role="status" className="mt-2 text-xs text-[#72D1A4]">{betNotice}</p>}
                  <button type="submit" disabled={betSaving || !betSelected || Number(betAmount) < 1000 || Number(betAmount) > (signedInUser.saldo ?? 0)} className="mt-3 w-full rounded-lg bg-[#D71920] px-3 py-2.5 text-[10px] font-black tracking-widest text-white disabled:cursor-not-allowed disabled:opacity-50">{betSaving ? 'REGISTRANDO…' : `APOSTAR POR ${betSelected === 'a' ? featuredFight.roosterA.name : betSelected === 'b' ? featuredFight.roosterB.name : 'UN GALLO'}`}</button>
                </form>
              })()}
              {!signedInUser && featuredFight.status !== 'finished' && <button onClick={() => setView('login')} className="rounded-xl border border-[#D71920]/40 bg-[#171717] p-4 text-left text-xs font-bold text-white hover:border-[#D71920]">Inicia sesión para apostar</button>}
            </> : <div className="flex flex-1 items-center rounded-xl border border-dashed border-[#333] bg-[#171717] p-5 text-sm text-[#A3A3A3]">El administrador aún no ha programado enfrentamientos.</div>}
            <div className="p-4 rounded-xl bg-[#171717] border border-[#2A2A2A]">
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 rounded-lg bg-[#0F0F0F] border border-[#2A2A2A]"><p className="text-[10px] font-heading font-semibold tracking-widest text-[#A3A3A3] mb-1">TU SALDO</p><p className="text-lg font-heading font-black text-[#D99024]">{signedInUser ? formatCOP(signedInUser.saldo ?? 0) : 'Inicia sesión'}</p></div>
                <div className="p-3 rounded-lg bg-[#0F0F0F] border border-[#2A2A2A]"><p className="text-[10px] font-heading font-semibold tracking-widest text-[#A3A3A3] mb-1">TIPO DE CUENTA</p><p className="text-lg font-heading font-black text-[#176B45]">{signedInUser ? (signedInUser.role === 'administrador' ? 'ADMIN' : 'USUARIO') : 'INVITADO'}</p></div>
              </div>
            </div>
            {signedInUser?.role === 'usuario' && myBets.length > 0 && <div className="p-4 rounded-xl bg-[#171717] border border-[#2A2A2A]">
              <p className="mb-2 text-[10px] font-heading font-black tracking-widest text-[#A3A3A3]">MIS APUESTAS</p>
              <div className="space-y-2">
                {[...myBets].reverse().slice(0, 3).map(bet => <div key={bet.id} className="border-t border-[#2A2A2A] pt-2 first:border-0 first:pt-0">
                  <p className="text-xs font-bold text-white">Pelea #{String(bet.fightNumber).padStart(3, '0')} · {bet.roosterName}</p>
                  <p className="mt-0.5 text-[10px] text-[#888]">Apuesta {formatCOP(bet.amount)} · cuota x{bet.multiplier.toFixed(2)}</p>
                  <p className={`mt-0.5 text-[10px] font-black ${bet.status === 'won' ? 'text-[#72D1A4]' : bet.status === 'lost' ? 'text-[#F58A8E]' : 'text-[#D99024]'}`}>{bet.status === 'won' ? `GANADA · Retorno ${formatCOP(bet.paidOut ?? bet.potentialPayout)}` : bet.status === 'lost' ? 'PERDIDA' : `PENDIENTE · Retorno potencial ${formatCOP(bet.potentialPayout)}`}</p>
                </div>)}
              </div>
            </div>}
          </div>
        </div>

        {/* ─── FIGHT INFO ─── */}
        <div className="mb-5 p-5 bg-[#171717] rounded-xl border border-[#2A2A2A] flex items-center gap-6 flex-wrap">
          <div className="flex items-center gap-3"><span className="font-heading font-black text-2xl text-[#D71920]">{featuredFight ? `#${String(featuredFight.number).padStart(3, '0')}` : '—'}</span></div>
          <div className="w-px h-10 bg-[#2A2A2A] hidden sm:block" />
          <div className="flex-1 min-w-48"><p className="text-[10px] font-heading font-semibold tracking-widest text-[#A3A3A3]">{featuredFight ? 'ENFRENTAMIENTO' : 'EVENTO DESTACADO'}</p><p className="font-heading font-black text-[#F5F5F5] text-lg">{featuredFight ? `${featuredFight.roosterA.name} VS ${featuredFight.roosterB.name}` : featuredEvent?.name ?? 'No hay eventos publicados'}</p>{featuredFight?.status === 'finished' && <p className="text-sm font-bold text-[#72D1A4]">Ganador oficial: {featuredFight.winnerRoosterName}</p>}{!featuredFight && featuredEvent && <p className="text-xs text-[#A3A3A3]">{featuredEvent.fights} peleas · {formatEventDate(featuredEvent.date)}</p>}</div>
          {(featuredFight || featuredEvent) && <div className="flex items-center gap-6 text-sm flex-wrap">
            <div><p className="text-[10px] font-heading font-semibold tracking-widest text-[#A3A3A3] mb-1">ESTADO</p><StatusBadge status={featuredFight ? fightStatusLabel(featuredFight.status) : eventStatusLabel(featuredEvent!.status)} /></div>
            <div><p className="text-[10px] font-heading font-semibold tracking-widest text-[#A3A3A3] mb-1">EVENTO</p><p className="font-heading font-semibold text-[#F5F5F5] text-sm">{featuredFight?.eventName ?? featuredEvent?.name}</p></div>
            <div><p className="text-[10px] font-heading font-semibold tracking-widest text-[#A3A3A3] mb-1">LUGAR</p><p className="font-heading font-semibold text-[#F5F5F5] text-sm">{featuredFight?.eventArena ?? featuredEvent?.arena}</p></div>
            <div><p className="text-[10px] font-heading font-semibold tracking-widest text-[#A3A3A3] mb-1">HORA</p><p className="font-heading font-semibold text-[#D99024] text-sm">{featuredFight?.eventTime ?? featuredEvent?.time}</p></div>
          </div>}
        </div>

        {/* ─── BOTTOM GRID: Upcoming Fights + Chat ─── */}
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] xl:grid-cols-[1fr_360px] gap-5">

          {/* UPCOMING FIGHTS */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-heading font-black text-base tracking-widest text-[#F5F5F5]">PELEAS Y RESULTADOS</h2>
              <button onClick={() => setView('events')} className="text-[10px] font-heading font-bold tracking-widest text-[#D71920] hover:text-[#F5F5F5] transition-colors">
                VER TODOS →
              </button>
            </div>
            <div className="flex flex-col gap-2.5">
              {eventsError && events.length === 0 ? (
                <p className="rounded-xl border border-[#D71920]/40 bg-[#D71920]/10 p-4 text-sm text-[#F58A8E]">No se pudo cargar la cartelera: {eventsError}</p>
              ) : orderedFights.length ? orderedFights.map(fight => (
                <div key={fight.id} className="flex items-center gap-4 p-4 bg-[#171717] rounded-xl border border-[#2A2A2A] hover:border-[#333] transition-all duration-200">
                  <div className="text-center flex-shrink-0 w-12"><p className="font-heading font-black text-lg text-[#D71920]">#{String(fight.number).padStart(3, '0')}</p><p className="text-[10px] font-heading text-[#A3A3A3]">{fight.eventTime}</p></div>
                  <div className="w-px h-10 bg-[#2A2A2A] flex-shrink-0" />
                  <div className="flex-1 min-w-0"><p className="font-heading font-bold text-sm text-[#F5F5F5] truncate">{fight.roosterA.name} <span className="text-[#D71920]">VS</span> {fight.roosterB.name}</p><p className="text-xs font-heading text-[#A3A3A3] truncate">{fight.eventName} · {formatEventDate(fight.eventDate)}</p>{fight.status !== 'finished' && <p className="mt-1 text-[10px] font-bold text-[#D99024]">Cuotas: {fight.roosterA.name} x{fight.oddsA.toFixed(2)} · {fight.roosterB.name} x{fight.oddsB.toFixed(2)}</p>}{fight.status === 'finished' && <p className="mt-1 text-xs font-bold text-[#72D1A4]">Ganador: {fight.winnerRoosterName}</p>}</div>
                  <div className="flex-shrink-0"><StatusBadge status={fightStatusLabel(fight.status)} /></div>
                </div>
              )) : scheduledEvents.length ? scheduledEvents.map(event => (
                <div key={event.id} className="flex items-center gap-4 p-4 bg-[#171717] rounded-xl border border-[#2A2A2A]">
                  <div className="text-center flex-shrink-0 w-12"><p className="font-heading font-black text-lg text-[#D71920]">#{event.id}</p><p className="text-[10px] font-heading text-[#A3A3A3]">{event.time}</p></div>
                  <div className="w-px h-10 bg-[#2A2A2A] flex-shrink-0" />
                  <div className="flex-1 min-w-0"><p className="font-heading font-bold text-sm text-[#F5F5F5] truncate">{event.name}</p><p className="text-xs font-heading text-[#A3A3A3] truncate">{formatEventDate(event.date)} · {event.arena} · {event.fights} peleas</p></div>
                  <div className="flex-shrink-0"><StatusBadge status={eventStatusLabel(event.status)} /></div>
                </div>
              )) : <p className="rounded-xl border border-[#2A2A2A] bg-[#171717] p-4 text-sm text-[#A3A3A3]">No hay eventos ni peleas programadas.</p>}
            </div>
          </div>

          {/* LIVE CHAT */}
          <div className="flex flex-col bg-[#171717] rounded-xl border border-[#2A2A2A] overflow-hidden" style={{ maxHeight: '380px' }}>
            <div className="flex items-center gap-2 px-4 py-3 border-b border-[#2A2A2A] flex-shrink-0">
              <span className="w-2 h-2 rounded-full bg-[#176B45] animate-pulse" />
              <span className="font-heading font-black text-sm tracking-widest text-[#F5F5F5]">CHAT EN VIVO</span>
              <span className="ml-auto text-[10px] font-heading text-[#A3A3A3]">2,847 online</span>
            </div>

            <div className="flex-1 overflow-y-auto p-3 flex flex-col gap-2 min-h-0">
              {messages.map(msg => (
                <div key={msg.id} className="flex gap-2 group">
                  <div className="w-6 h-6 rounded-full bg-gradient-to-br from-[#D71920] to-[#7A3E20] flex items-center justify-center text-[9px] font-heading font-black flex-shrink-0 mt-0.5">
                    {msg.user[0]}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-baseline gap-1.5 flex-wrap">
                      <span className={`text-xs font-heading font-bold ${msg.user === 'Tú' ? 'text-[#D71920]' : 'text-[#D99024]'}`}>
                        {msg.user}
                      </span>
                      <span className="text-[10px] text-[#A3A3A3] font-mono">{msg.time}</span>
                    </div>
                    <p className="text-xs text-[#D1D1D1] leading-relaxed mt-0.5">{msg.msg}</p>
                  </div>
                </div>
              ))}
              <div ref={chatEndRef} />
            </div>

            <div className="p-3 border-t border-[#2A2A2A] flex gap-2 flex-shrink-0">
              <input
                type="text"
                value={chatInput}
                onChange={e => setChatInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && sendMessage()}
                placeholder="Escribe un mensaje..."
                className="flex-1 bg-[#0F0F0F] border border-[#2A2A2A] rounded-lg px-3 py-2 text-xs text-[#F5F5F5] placeholder:text-[#555] outline-none focus:border-[#D71920] transition-colors font-body"
              />
              <button onClick={sendMessage}
                className="w-8 h-8 rounded-lg bg-[#D71920] hover:bg-[#A01218] flex items-center justify-center transition-all duration-200 text-[#F5F5F5] flex-shrink-0 shadow-lg shadow-[#D71920]/20">
                <IconSend />
              </button>
            </div>
          </div>
        </div>
      </main>

      {/* ─── FOOTER ─── */}
      <footer className="mt-12 border-t border-[#1F1F1F] py-6 px-6">
        <div className="max-w-[1440px] mx-auto flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-3">
            <RoosterLogo size={24} />
            <span className="font-heading font-black text-sm tracking-wider text-[#A3A3A3]">
              GALLER<span className="text-[#D71920]">APP</span>
            </span>
            <span className="text-[#2A2A2A] text-xs">|</span>
            <span className="text-xs text-[#555] font-heading">Plataforma de transmisión deportiva</span>
          </div>
          <div className="flex items-center gap-6 text-[10px] font-heading tracking-widest text-[#555]">
            <button className="hover:text-[#A3A3A3] transition-colors">TÉRMINOS</button>
            <button className="hover:text-[#A3A3A3] transition-colors">PRIVACIDAD</button>
            <button className="hover:text-[#A3A3A3] transition-colors">CONTACTO</button>
            <span>© 2026 GallerApp</span>
          </div>
        </div>
      </footer>
    </div>
  )
}
