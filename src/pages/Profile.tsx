import { useEffect, useState, type FormEvent } from 'react'
import { RoosterLogo } from '../components/RoosterLogo'
import { apiRequest, type GallerUser } from '../lib/api'

interface ProfileData extends GallerUser { fecha: string; documento: string; profileImage: string }
interface ProfileProps { user: GallerUser; onBack: () => void; onUpdated: (profile: ProfileData) => void }

const fieldClass = 'w-full rounded-xl border border-[#2A2A2A] bg-[#0F0F0F] px-4 py-3 text-sm text-[#F5F5F5] outline-none transition-colors focus:border-[#D71920]'

async function prepareImage(file: File) {
  if (file.type !== 'image/jpeg') throw new Error('La foto de perfil debe estar en formato JPG.')
  if (file.size > 8 * 1024 * 1024) throw new Error('La imagen original debe pesar menos de 8 MB.')
  const bitmap = await createImageBitmap(file)
  const scale = Math.min(1, 600 / Math.max(bitmap.width, bitmap.height))
  const canvas = document.createElement('canvas')
  canvas.width = Math.max(1, Math.round(bitmap.width * scale))
  canvas.height = Math.max(1, Math.round(bitmap.height * scale))
  const context = canvas.getContext('2d')
  if (!context) throw new Error('No se pudo procesar la imagen.')
  context.drawImage(bitmap, 0, 0, canvas.width, canvas.height)
  bitmap.close()
  const result = canvas.toDataURL('image/jpeg', 0.86)
  if (Math.floor((result.split(',')[1] || '').length * 0.75) > 1_500_000) throw new Error('La imagen optimizada supera 1.5 MB.')
  return result
}

export default function Profile({ user, onBack, onUpdated }: ProfileProps) {
  const [profile, setProfile] = useState<ProfileData>({ ...user, fecha: user.fecha || '', documento: user.documento || '', profileImage: '' })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')

  useEffect(() => {
    let active = true
    apiRequest<{ profile: ProfileData }>('/auth/profile')
      .then(result => { if (active) setProfile(result.profile) })
      .catch(err => { if (active) setError(err instanceof Error ? err.message : 'No se pudo cargar tu perfil.') })
      .finally(() => { if (active) setLoading(false) })
    return () => { active = false }
  }, [])

  function set<K extends keyof ProfileData>(key: K, value: ProfileData[K]) {
    setProfile(current => ({ ...current, [key]: value }))
  }

  async function chooseImage(file?: File) {
    if (!file) return
    setError('')
    setNotice('')
    try { set('profileImage', await prepareImage(file)) }
    catch (err) { setError(err instanceof Error ? err.message : 'No se pudo cargar la foto.') }
  }

  async function saveProfile(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setSaving(true)
    setError('')
    setNotice('')
    try {
      const result = await apiRequest<{ profile: ProfileData }>('/auth/profile', profile, 'PUT')
      setProfile(result.profile)
      onUpdated(result.profile)
      setNotice('Tus datos se guardaron correctamente.')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo guardar el perfil.')
    } finally { setSaving(false) }
  }

  return <main className="min-h-screen bg-[#0B0B0B] px-4 py-8 text-[#F5F5F5] sm:px-6">
    <div className="mx-auto max-w-3xl">
      <header className="mb-8 flex items-center justify-between border-b border-[#D71920]/20 pb-5">
        <div className="flex items-center gap-3"><RoosterLogo size={38} /><span className="font-heading text-xl font-black tracking-wider">GALLER<span className="text-[#D71920]">APP</span></span></div>
        <button onClick={onBack} className="rounded-lg border border-[#333] px-4 py-2 text-xs font-bold tracking-widest text-[#AAA] hover:text-white">VOLVER</button>
      </header>

      <section className="overflow-hidden rounded-2xl border border-[#2A2A2A] bg-[#151515] shadow-2xl shadow-black/30">
        <div className="border-b border-[#2A2A2A] p-6 sm:p-8">
          <p className="text-[10px] font-black tracking-[0.22em] text-[#D71920]">MI CUENTA</p>
          <h1 className="mt-2 font-heading text-3xl font-black">Mi perfil</h1>
          <p className="mt-2 text-sm text-[#A3A3A3]">Consulta y actualiza tus datos personales y foto de perfil.</p>
        </div>

        {loading ? <p className="p-8 text-sm text-[#A3A3A3]">Cargando tu información…</p> : <form onSubmit={saveProfile} className="space-y-6 p-6 sm:p-8">
          <div className="flex flex-col items-center gap-4 rounded-xl border border-[#2A2A2A] bg-[#101010] p-5 sm:flex-row">
            <div className="flex h-24 w-24 flex-shrink-0 items-center justify-center overflow-hidden rounded-full border-2 border-[#D71920]/60 bg-[#231415] text-3xl font-black text-white">
              {profile.profileImage ? <img src={profile.profileImage} alt="Foto de perfil" className="h-full w-full object-cover" /> : profile.nombre.slice(0, 1).toUpperCase()}
            </div>
            <div className="text-center sm:text-left">
              <p className="font-heading text-sm font-black tracking-widest">FOTO DE PERFIL</p>
              <p className="mt-1 text-xs text-[#888]">Solo JPG · imagen optimizada automáticamente · máximo 1.5 MB</p>
              <div className="mt-3 flex flex-wrap justify-center gap-2 sm:justify-start">
                <label className="cursor-pointer rounded-lg bg-[#D71920] px-3 py-2 text-[10px] font-black tracking-wider text-white hover:bg-[#A01218]">SUBIR FOTO
                  <input type="file" accept="image/jpeg" className="hidden" onChange={event => { void chooseImage(event.target.files?.[0]); event.target.value = '' }} />
                </label>
                {profile.profileImage && <button type="button" onClick={() => set('profileImage', '')} className="rounded-lg border border-[#444] px-3 py-2 text-[10px] font-bold tracking-wider text-[#AAA]">QUITAR FOTO</button>}
              </div>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <label className="text-[10px] font-bold tracking-widest text-[#A3A3A3]">NOMBRE
              <input required maxLength={80} value={profile.nombre} onChange={event => set('nombre', event.target.value)} className={`${fieldClass} mt-1.5`} />
            </label>
            <label className="text-[10px] font-bold tracking-widest text-[#A3A3A3]">APELLIDO
              <input required maxLength={80} value={profile.apellido} onChange={event => set('apellido', event.target.value)} className={`${fieldClass} mt-1.5`} />
            </label>
            <label className="text-[10px] font-bold tracking-widest text-[#A3A3A3] sm:col-span-2">CORREO ELECTRÓNICO
              <input required type="email" maxLength={254} value={profile.email} onChange={event => set('email', event.target.value)} className={`${fieldClass} mt-1.5`} />
            </label>
            <label className="text-[10px] font-bold tracking-widest text-[#A3A3A3]">TELÉFONO
              <input required type="tel" maxLength={30} value={profile.telefono} onChange={event => set('telefono', event.target.value)} className={`${fieldClass} mt-1.5`} />
            </label>
            <label className="text-[10px] font-bold tracking-widest text-[#A3A3A3]">PAÍS
              <input required maxLength={80} value={profile.pais} onChange={event => set('pais', event.target.value)} className={`${fieldClass} mt-1.5`} />
            </label>
            <label className="text-[10px] font-bold tracking-widest text-[#A3A3A3]">FECHA DE NACIMIENTO
              <input type="date" value={profile.fecha} onChange={event => set('fecha', event.target.value)} className={`${fieldClass} mt-1.5`} />
            </label>
            <label className="text-[10px] font-bold tracking-widest text-[#A3A3A3]">DOCUMENTO DE IDENTIDAD
              <input required maxLength={40} value={profile.documento} onChange={event => set('documento', event.target.value)} className={`${fieldClass} mt-1.5`} />
            </label>
            <div className="text-[10px] font-bold tracking-widest text-[#A3A3A3]">SALDO ACTUAL
              <div className="mt-1.5 flex flex-wrap items-center gap-2 rounded-xl border border-[#2A2A2A] bg-[#0F0F0F] p-2">
                <p className="px-2 py-2 text-base font-black text-[#D99024]">${new Intl.NumberFormat('es-CO').format(profile.saldo ?? 0)}</p>
                <button type="button" onClick={() => window.alert('La pasarela de retiros se conectará más adelante.')} className="ml-auto rounded-lg border border-[#D99024]/50 px-3 py-2 text-[9px] font-black tracking-wider text-[#D99024] transition-colors hover:bg-[#D99024]/10">RETIRAR SALDO</button>
              </div>
            </div>
          </div>

          {error && <p role="alert" className="rounded-xl border border-[#D71920]/40 bg-[#D71920]/10 px-4 py-3 text-sm text-[#F5A0A3]">{error}</p>}
          {notice && <p role="status" className="rounded-xl border border-[#176B45]/40 bg-[#176B45]/10 px-4 py-3 text-sm text-[#72D1A4]">{notice}</p>}
          <div className="flex flex-wrap justify-end gap-3 border-t border-[#2A2A2A] pt-5">
            <button type="button" onClick={onBack} className="rounded-lg border border-[#444] px-5 py-3 text-xs font-black tracking-widest text-[#AAA]">CANCELAR</button>
            <button disabled={saving} className="rounded-lg bg-[#D71920] px-6 py-3 text-xs font-black tracking-widest text-white disabled:opacity-50">{saving ? 'GUARDANDO…' : 'GUARDAR CAMBIOS'}</button>
          </div>
        </form>}
      </section>
    </div>
  </main>
}
