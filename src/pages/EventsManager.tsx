import { useEffect, useState } from 'react'
import { apiRequest } from '../lib/api'

type EventStatus = 'live' | 'upcoming' | 'finished'
interface EventItem { id: string; name: string; date: string; time: string; arena: string; fights: number; status: EventStatus; prize: number }
type EventForm = Omit<EventItem, 'id'>
const blank: EventForm = { name: '', date: '', time: '', arena: '', fights: 1, status: 'upcoming', prize: 0 }
const statusLabels: Record<EventStatus, string> = { live: 'En vivo', upcoming: 'Próximo', finished: 'Finalizado' }

export default function EventsManager() {
  const [events, setEvents] = useState<EventItem[]>([])
  const [form, setForm] = useState<EventForm>(blank)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  async function refresh() {
    setLoading(true)
    try {
      const result = await apiRequest<{ events: EventItem[] }>('/events')
      setEvents(result.events)
      setError('')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo cargar la cartelera.')
    } finally { setLoading(false) }
  }
  useEffect(() => { void refresh() }, [])

  function edit(event: EventItem) {
    const { id, ...values } = event
    setEditingId(id)
    setForm(values)
    setError('')
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }
  function reset() { setEditingId(null); setForm(blank); setError('') }

  async function save(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    setError('')
    try {
      await apiRequest(editingId ? `/admin/events/${editingId}` : '/admin/events', form, editingId ? 'PUT' : 'POST')
      reset()
      await refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo guardar el evento.')
    } finally { setSaving(false) }
  }

  async function remove(event: EventItem) {
    if (!window.confirm(`¿Eliminar “${event.name}” de la cartelera y del calendario?`)) return
    setError('')
    try {
      await apiRequest(`/admin/events/${event.id}`, undefined, 'DELETE')
      if (editingId === event.id) reset()
      await refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo eliminar el evento.')
    }
  }

  const inputClass = 'w-full rounded-lg border border-[#333] bg-[#0F0F0F] px-3 py-2.5 text-sm text-white outline-none focus:border-[#D71920]'
  const labelClass = 'flex flex-col gap-1.5 text-xs font-semibold text-[#A3A3A3]'
  return <section className="mt-8 border-t border-[#2A2A2A] pt-7">
    <h2 className="text-xl font-black">Gestión de eventos</h2>
    <p className="mt-1 mb-5 text-sm text-[#A3A3A3]">Los cambios se guardan y se reflejan en la cartelera y el calendario.</p>
    {error && <p role="alert" className="mb-4 rounded-lg border border-[#D71920]/40 bg-[#D71920]/10 p-3 text-sm text-[#F5A0A3]">{error}</p>}
    <form onSubmit={save} className="grid gap-3 rounded-xl border border-[#2A2A2A] bg-[#101010] p-4 sm:grid-cols-2">
      <label className={labelClass}>Nombre del evento<input className={inputClass} required value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} /></label>
      <label className={labelClass}>Fecha<input className={inputClass} type="date" required value={form.date} onChange={e => setForm({ ...form, date: e.target.value })} /></label>
      <label className={labelClass}>Hora<input className={inputClass} required value={form.time} placeholder="7:30 PM" onChange={e => setForm({ ...form, time: e.target.value })} /></label>
      <label className={labelClass}>Gallera / lugar<input className={inputClass} required value={form.arena} onChange={e => setForm({ ...form, arena: e.target.value })} /></label>
      <label className={labelClass}>Número de peleas<input className={inputClass} type="number" min="1" required value={form.fights} onChange={e => setForm({ ...form, fights: Number(e.target.value) })} /></label>
      <label className={labelClass}>Bolsa de premios<input className={inputClass} type="number" min="0" step="1000" value={form.prize} onChange={e => setForm({ ...form, prize: Number(e.target.value) })} /></label>
      <label className={labelClass}>Estado<select className={inputClass} value={form.status} onChange={e => setForm({ ...form, status: e.target.value as EventStatus })}>{Object.entries(statusLabels).map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></label>
      <div className="flex items-end gap-2"><button disabled={saving} className="rounded-lg bg-[#D71920] px-4 py-2.5 text-xs font-black tracking-wider text-white disabled:opacity-60">{saving ? 'GUARDANDO…' : editingId ? 'GUARDAR CAMBIOS' : 'AGREGAR EVENTO'}</button>{editingId && <button type="button" onClick={reset} className="rounded-lg border border-[#333] px-4 py-2.5 text-xs font-bold text-[#A3A3A3]">CANCELAR</button>}</div>
    </form>
    <div className="mt-5 space-y-2">
      {loading ? <p className="text-sm text-[#888]">Cargando eventos…</p> : events.length === 0 ? <p className="rounded-lg border border-dashed border-[#333] p-5 text-center text-sm text-[#888]">No hay eventos en la cartelera.</p> : events.map(event => <article key={event.id} className="flex flex-col justify-between gap-3 rounded-lg border border-[#2A2A2A] bg-[#101010] p-4 sm:flex-row sm:items-center"><div><h3 className="font-bold">{event.name}</h3><p className="mt-1 text-xs text-[#A3A3A3]">{event.date} · {event.time} · Gallera {event.arena} · {event.fights} peleas · {statusLabels[event.status]}</p></div><div className="flex gap-2"><button onClick={() => edit(event)} className="rounded border border-[#444] px-3 py-2 text-xs font-bold text-white">EDITAR</button><button onClick={() => void remove(event)} className="rounded border border-[#D71920]/40 px-3 py-2 text-xs font-bold text-[#F58A8E]">ELIMINAR</button></div></article>)}
    </div>
  </section>
}
