import { useEffect, useMemo, useState, type FormEvent } from 'react'
import { apiRequest } from '../lib/api'

type FightStatus = 'upcoming' | 'live' | 'finished'
interface EventItem { id: string; name: string; fights: number; status: 'live' | 'upcoming' | 'finished' }
interface RoosterItem { id: string; name: string; code: string; status: 'active' | 'inactive' }
interface FightItem {
  id: string
  number: number
  eventId: string
  eventName: string
  eventDate: string
  eventTime: string
  eventArena: string
  oddsA: number
  oddsB: number
  roosterA: { id: string; name: string; code: string }
  roosterB: { id: string; name: string; code: string }
  status: FightStatus
  winnerRoosterId: string | null
  winnerRoosterName: string | null
}

const statusLabel: Record<FightStatus, string> = { upcoming: 'Programada', live: 'En vivo', finished: 'Finalizada' }
const fieldClass = 'w-full rounded-lg border border-[#333] bg-[#0F0F0F] px-3 py-2.5 text-sm text-white outline-none focus:border-[#D71920]'
const actionClass = 'rounded-lg border border-[#444] px-3 py-2 text-[10px] font-black tracking-wider text-white disabled:opacity-50'

function FightOddsEditor({ fight, busy, onSave }: { fight: FightItem; busy: boolean; onSave: (oddsA: number, oddsB: number) => void }) {
  const [oddsA, setOddsA] = useState(String(fight.oddsA || 1.85))
  const [oddsB, setOddsB] = useState(String(fight.oddsB || 2.10))
  useEffect(() => { setOddsA(String(fight.oddsA || 1.85)); setOddsB(String(fight.oddsB || 2.10)) }, [fight.oddsA, fight.oddsB])
  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    onSave(Number(oddsA), Number(oddsB))
  }
  return <form onSubmit={submit} className="mt-4 rounded-lg border border-[#2A2A2A] bg-[#0B0B0B] p-3">
    <p className="mb-2 text-[9px] font-black tracking-widest text-[#A3A3A3]">CUOTAS PARA ESTA PELEA</p>
    <div className="grid grid-cols-2 gap-2">
      <label className="text-[9px] font-bold text-[#A3A3A3]">GALLO A · {fight.roosterA.name}
        <input type="number" min="1.01" max="100" step="0.01" required value={oddsA} onChange={event => setOddsA(event.target.value)} className={`${fieldClass} mt-1`} />
      </label>
      <label className="text-[9px] font-bold text-[#A3A3A3]">GALLO B · {fight.roosterB.name}
        <input type="number" min="1.01" max="100" step="0.01" required value={oddsB} onChange={event => setOddsB(event.target.value)} className={`${fieldClass} mt-1`} />
      </label>
    </div>
    <button disabled={busy} className={`${actionClass} mt-3 border-[#D99024]/40 text-[#D99024]`}>{busy ? 'GUARDANDO…' : 'ACTUALIZAR CUOTAS'}</button>
  </form>
}

export default function FightsManager() {
  const [events, setEvents] = useState<EventItem[]>([])
  const [roosters, setRoosters] = useState<RoosterItem[]>([])
  const [fights, setFights] = useState<FightItem[]>([])
  const [eventId, setEventId] = useState('')
  const [roosterAId, setRoosterAId] = useState('')
  const [roosterBId, setRoosterBId] = useState('')
  const [oddsA, setOddsA] = useState('1.85')
  const [oddsB, setOddsB] = useState('2.10')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [busyId, setBusyId] = useState<string | null>(null)

  async function refresh() {
    try {
      const [eventData, roosterData, fightData] = await Promise.all([
        apiRequest<{ events: EventItem[] }>('/events'),
        apiRequest<{ roosters: RoosterItem[] }>('/roosters'),
        apiRequest<{ fights: FightItem[] }>('/fights'),
      ])
      setEvents(eventData.events)
      setRoosters(roosterData.roosters)
      setFights(fightData.fights)
      setError('')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudieron cargar las peleas.')
    } finally { setLoading(false) }
  }
  useEffect(() => {
    void refresh()
    const interval = window.setInterval(() => { void refresh() }, 3000)
    return () => window.clearInterval(interval)
  }, [])

  const availableEvents = useMemo(() => events.filter(event => event.status !== 'finished'), [events])
  const activeRoosters = useMemo(() => roosters.filter(rooster => rooster.status === 'active'), [roosters])
  const selectedEvent = events.find(event => event.id === eventId)
  const scheduledCount = fights.filter(fight => fight.eventId === eventId).length
  const canSchedule = Boolean(selectedEvent && selectedEvent.status !== 'finished' && scheduledCount < selectedEvent.fights)

  async function createFight(event: React.FormEvent) {
    event.preventDefault()
    if (!canSchedule) return
    setSaving(true)
    setError('')
    try {
      await apiRequest('/admin/fights', { eventId, roosterAId, roosterBId, oddsA: Number(oddsA), oddsB: Number(oddsB) }, 'POST')
      setRoosterAId('')
      setRoosterBId('')
      await refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo programar la pelea.')
    } finally { setSaving(false) }
  }

  async function updateFight(fight: FightItem, action: 'start' | 'finish', winnerRoosterId?: string) {
    setBusyId(fight.id)
    setError('')
    try {
      await apiRequest(`/admin/fights/${fight.id}/${action}`, action === 'finish' ? { winnerRoosterId } : {}, 'PUT')
      await refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo actualizar la pelea.')
    } finally { setBusyId(null) }
  }

  async function cancelFight(fight: FightItem) {
    if (!window.confirm(`¿Cancelar la pelea #${fight.number} de ${fight.eventName}?`)) return
    setBusyId(fight.id)
    setError('')
    try {
      await apiRequest(`/admin/fights/${fight.id}`, undefined, 'DELETE')
      await refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo cancelar la pelea.')
    } finally { setBusyId(null) }
  }

  async function saveOdds(fight: FightItem, nextOddsA: number, nextOddsB: number) {
    setBusyId(fight.id)
    setError('')
    try {
      await apiRequest(`/admin/fights/${fight.id}/odds`, { oddsA: nextOddsA, oddsB: nextOddsB }, 'PUT')
      await refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudieron actualizar las cuotas.')
    } finally { setBusyId(null) }
  }

  return <section className="mt-8 border-t border-[#2A2A2A] pt-7">
    <h2 className="text-xl font-black">Gestión de peleas y resultados</h2>
    <p className="mb-5 mt-1 text-sm text-[#A3A3A3]">Elige un evento y asigna dos gallos registrados y activos: uno como Gallo A y otro como Gallo B. La lista se actualiza automáticamente.</p>
    {error && <p role="alert" className="mb-4 rounded-lg border border-[#D71920]/40 bg-[#D71920]/10 p-3 text-sm text-[#F5A0A3]">{error}</p>}

    <form onSubmit={createFight} className="grid gap-3 rounded-xl border border-[#2A2A2A] bg-[#101010] p-4 sm:grid-cols-2">
      <label className="flex flex-col gap-1.5 text-xs font-semibold text-[#A3A3A3] sm:col-span-2">Evento
        <select className={fieldClass} required value={eventId} onChange={e => setEventId(e.target.value)}>
          <option value="">Selecciona un evento</option>
          {availableEvents.map(event => {
            const count = fights.filter(fight => fight.eventId === event.id).length
            return <option key={event.id} value={event.id} disabled={count >= event.fights}>{event.name} · {count}/{event.fights} peleas registradas</option>
          })}
        </select>
      </label>
      <label className="flex flex-col gap-1.5 text-xs font-semibold text-[#A3A3A3]">Gallo A
        <select className={fieldClass} required value={roosterAId} onChange={e => setRoosterAId(e.target.value)}>
        <option value="">Selecciona el Gallo A registrado</option>
          {activeRoosters.map(rooster => <option key={rooster.id} value={rooster.id} disabled={rooster.id === roosterBId}>{rooster.name} · {rooster.code}</option>)}
        </select>
      </label>
      <label className="flex flex-col gap-1.5 text-xs font-semibold text-[#A3A3A3]">Gallo B
        <select className={fieldClass} required value={roosterBId} onChange={e => setRoosterBId(e.target.value)}>
        <option value="">Selecciona el Gallo B registrado</option>
          {activeRoosters.map(rooster => <option key={rooster.id} value={rooster.id} disabled={rooster.id === roosterAId}>{rooster.name} · {rooster.code}</option>)}
        </select>
      </label>
      <label className="flex flex-col gap-1.5 text-xs font-semibold text-[#A3A3A3]">Cuota Gallo A
        <input className={fieldClass} type="number" min="1.01" max="100" step="0.01" required value={oddsA} onChange={e => setOddsA(e.target.value)} />
      </label>
      <label className="flex flex-col gap-1.5 text-xs font-semibold text-[#A3A3A3]">Cuota Gallo B
        <input className={fieldClass} type="number" min="1.01" max="100" step="0.01" required value={oddsB} onChange={e => setOddsB(e.target.value)} />
      </label>
      <div className="flex items-end sm:col-span-2">
        <button disabled={saving || !canSchedule || !roosterAId || !roosterBId} className="rounded-lg bg-[#D71920] px-4 py-2.5 text-xs font-black tracking-wider text-white disabled:opacity-50">{saving ? 'GUARDANDO…' : 'PROGRAMAR PELEA'}</button>
        {selectedEvent && <span className="ml-3 pb-2 text-xs text-[#888]">{selectedEvent.fights - scheduledCount} cupos disponibles en este evento</span>}
      </div>
    </form>

    <div className="mt-5 space-y-3">
      {loading ? <p className="text-sm text-[#888]">Cargando peleas…</p> : fights.length === 0 ? <p className="rounded-lg border border-dashed border-[#333] p-5 text-center text-sm text-[#888]">Todavía no hay enfrentamientos programados.</p> : fights.map(fight => {
        const busy = busyId === fight.id
        return <article key={fight.id} className="rounded-xl border border-[#2A2A2A] bg-[#101010] p-4">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-widest text-[#D71920]">{fight.eventName} · PELEA #{String(fight.number).padStart(3, '0')}</p>
              <h3 className="mt-1 font-heading text-base font-black">{fight.roosterA.name} <span className="text-[#D71920]">VS</span> {fight.roosterB.name}</h3>
              <p className="mt-1 text-xs text-[#888]">{fight.eventDate} · {fight.eventTime} · Gallera {fight.eventArena}</p>
              <p className="mt-1 text-xs font-semibold text-[#D99024]">Cuota {fight.roosterA.name}: x{fight.oddsA || 1.85} · {fight.roosterB.name}: x{fight.oddsB || 2.10}</p>
            </div>
            <span className={`rounded-full px-3 py-1 text-[9px] font-black tracking-widest ${fight.status === 'live' ? 'bg-[#D71920]/15 text-[#F58A8E]' : fight.status === 'upcoming' ? 'bg-[#D99024]/10 text-[#D99024]' : 'bg-[#252525] text-[#AAA]'}`}>{statusLabel[fight.status]}</span>
          </div>
          {fight.status === 'upcoming' && <div className="mt-4 flex flex-wrap gap-2">
            <button disabled={busy} onClick={() => void updateFight(fight, 'start')} className={`${actionClass} border-[#176B45]/60 bg-[#176B45]/20 text-[#72D1A4]`}>{busy ? 'ACTUALIZANDO…' : 'INICIAR PELEA'}</button>
            <button disabled={busy} onClick={() => void cancelFight(fight)} className={`${actionClass} text-[#F58A8E]`}>CANCELAR</button>
          </div>}
          {fight.status === 'upcoming' && <FightOddsEditor fight={fight} busy={busy} onSave={(a, b) => void saveOdds(fight, a, b)} />}
          {fight.status === 'live' && <div className="mt-4 flex flex-wrap gap-2">
            <button disabled={busy} onClick={() => void updateFight(fight, 'finish', fight.roosterA.id)} className={`${actionClass} border-[#D71920]/50 bg-[#D71920]/15 text-white`}>{busy ? 'GUARDANDO…' : `FINALIZAR · GANÓ ${fight.roosterA.name}`}</button>
            <button disabled={busy} onClick={() => void updateFight(fight, 'finish', fight.roosterB.id)} className={`${actionClass} border-[#D71920]/50 bg-[#D71920]/15 text-white`}>{busy ? 'GUARDANDO…' : `FINALIZAR · GANÓ ${fight.roosterB.name}`}</button>
          </div>}
          {fight.status === 'finished' && <p className="mt-3 rounded-lg border border-[#176B45]/40 bg-[#176B45]/10 px-3 py-2 text-sm font-bold text-[#72D1A4]">Ganador oficial: {fight.winnerRoosterName}</p>}
        </article>
      })}
    </div>
  </section>
}
