import { useState } from 'react'
import { apiRequest } from '../lib/api'
import { RoosterLogo } from '../components/RoosterLogo'

interface RoostersProps {
  signedInUser: { nombre: string; apellido: string; role: 'administrador' | 'usuario'; profileImage?: string } | null
  onBack: () => void
  onGoEvents: () => void
  onGoRoosterDirectory: () => void
  onGoAbout: () => void
  onGoLogin: () => void
  onGoAdmin: () => void
  onGoRegister: () => void
  onGoProfile: () => void
  onLogout: () => void
}

interface RoosterForm {
  name: string
  ring: string
  breed: string
  weight: string
  age: string
  arena: string
  wins: string
}

const initialForm: RoosterForm = {
  name: '',
  ring: '',
  breed: '',
  weight: '',
  age: '',
  arena: '',
  wins: '',
}

function IconUpload() {
  return (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
      <polyline points="17 8 12 3 7 8" />
      <line x1="12" y1="3" x2="12" y2="15" />
    </svg>
  )
}

function IconCheck() {
  return (
    <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="20 6 9 17 4 12" />
    </svg>
  )
}

export default function Roosters({ signedInUser, onBack, onGoEvents, onGoRoosterDirectory, onGoAbout, onGoLogin, onGoAdmin, onGoRegister, onGoProfile, onLogout }: RoostersProps) {
  const [form, setForm] = useState<RoosterForm>(initialForm)
  const [photo, setPhoto] = useState<string | null>(null)
  const [photoName, setPhotoName] = useState('')
  const [submitted, setSubmitted] = useState<RoosterForm | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  function updateField(field: keyof RoosterForm, value: string) {
    setForm(current => ({ ...current, [field]: value }))
    setSubmitted(null)
  }

  function handlePhoto(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]
    if (!file) return
    if (!['image/png', 'image/jpeg', 'image/webp'].includes(file.type) || file.size > 1_500_000) {
      setError('La foto debe ser JPG, PNG o WEBP y pesar máximo 1.5 MB.')
      event.target.value = ''
      return
    }
    setError('')

    const reader = new FileReader()
    reader.onload = () => {
      setPhoto(String(reader.result))
      setPhotoName(file.name)
      setSubmitted(null)
    }
    reader.readAsDataURL(file)
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault()
    setLoading(true)
    setError('')
    try {
      await apiRequest('/roosters', {
        name: form.name,
        code: form.ring,
        breed: form.breed,
        weight: form.weight,
        age: form.age,
        arena: form.arena,
        wins: form.wins,
        image: photo || '',
      })
      setSubmitted(form)
      window.setTimeout(() => {
        document.getElementById('registro-confirmado')?.scrollIntoView({ behavior: 'smooth', block: 'center' })
      }, 0)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo inscribir el gallo.')
    } finally {
      setLoading(false)
    }
  }

  function resetForm() {
    setForm(initialForm)
    setPhoto(null)
    setPhotoName('')
    setSubmitted(null)
    setError('')
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  return (
    <div className="min-h-screen overflow-x-hidden bg-[#0B0B0B] text-[#F5F5F5] font-body">
      <header className="sticky top-0 z-50 border-b border-[#D71920]/20 bg-[#0B0B0B]/95 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-[1440px] items-center justify-between gap-3 px-4 sm:gap-6 sm:px-6">
          <button onClick={onBack} className="group flex flex-shrink-0 items-center gap-2 sm:gap-3">
            <RoosterLogo size={38} />
            <span className="font-heading text-lg font-black tracking-wider text-[#F5F5F5] transition-colors group-hover:text-[#D71920] sm:text-xl">
              GALLER<span className="text-[#D71920] group-hover:text-[#F5F5F5]">APP</span>
            </span>
          </button>

          <nav className="hidden items-center gap-1 md:flex">
            <button
              onClick={onBack}
              className="rounded px-4 py-2 font-heading text-xs font-semibold tracking-widest text-[#A3A3A3] transition-colors hover:bg-[#171717] hover:text-[#F5F5F5]"
            >
              PELEAS
            </button>
            <button
              onClick={onGoEvents}
              className="rounded px-4 py-2 font-heading text-xs font-semibold tracking-widest text-[#A3A3A3] transition-colors hover:bg-[#171717] hover:text-[#F5F5F5]"
            >
              EVENTOS
            </button>
            <button className="rounded bg-[#171717] px-4 py-2 font-heading text-xs font-semibold tracking-widest text-[#F5F5F5]">INSCRIBE TU GALLO</button>
            <button onClick={onGoRoosterDirectory} className="rounded px-4 py-2 font-heading text-xs font-semibold tracking-widest text-[#A3A3A3] hover:bg-[#171717] hover:text-[#F5F5F5]">GALLOS</button>
            <button
              onClick={onGoAbout}
              className="rounded px-4 py-2 font-heading text-xs font-semibold tracking-widest text-[#A3A3A3] transition-colors hover:bg-[#171717] hover:text-[#F5F5F5]"
            >
              QUIÉNES SOMOS
            </button>
          </nav>

          <div className="flex flex-shrink-0 items-center gap-2 sm:gap-3">
            {signedInUser ? (
              <>
                <div className="hidden items-center gap-2 rounded border border-[#2A2A2A] bg-[#171717] px-3 py-2 sm:flex">
                  {signedInUser.profileImage ? <img src={signedInUser.profileImage} alt="" className="h-7 w-7 rounded-full object-cover" /> : <span className="flex h-7 w-7 items-center justify-center rounded-full bg-[#D71920] font-heading text-[10px] font-black text-white">{signedInUser.nombre.charAt(0).toUpperCase()}</span>}
                  <span className="max-w-28 truncate font-heading text-xs font-bold text-white">{signedInUser.nombre} {signedInUser.apellido}</span>
                  <span className="rounded bg-[#2A2A2A] px-1.5 py-1 font-heading text-[8px] font-black text-[#A3A3A3]">{signedInUser.role === 'administrador' ? 'ADMIN' : 'USUARIO'}</span>
                </div>
                {signedInUser.role === 'administrador' && <button onClick={onGoAdmin} className="rounded bg-[#D71924] px-3 py-2 font-heading text-[9px] font-black tracking-wider text-white sm:px-4 sm:text-[10px]">PANEL ADMIN</button>}
                <button onClick={onGoProfile} className="hidden rounded border border-[#2A2A2A] px-3 py-2 font-heading text-[10px] font-bold tracking-wider text-[#A3A3A3] hover:text-white md:block">MI PERFIL</button>
                <button onClick={onLogout} className="rounded border border-[#2A2A2A] px-3 py-2 font-heading text-[10px] font-bold tracking-wider text-[#A3A3A3] hover:text-white">SALIR</button>
              </>
            ) : (
              <>
            <button
              onClick={onGoAdmin}
              className="rounded border border-[#D99024]/50 bg-[#D99024]/10 px-2.5 py-2 font-heading text-[9px] font-black tracking-wider text-[#D99024] transition-all hover:border-[#D99024] hover:bg-[#D99024] hover:text-[#0B0B0B] sm:px-4 sm:text-[10px]"
              aria-label="Acceso para administradores"
            >
              ADMIN
            </button>
            <button
              onClick={onGoLogin}
              className="hidden rounded border border-[#2A2A2A] px-4 py-2 font-heading text-xs font-bold tracking-widest text-[#A3A3A3] transition-all hover:border-[#444] hover:text-[#F5F5F5] md:block"
            >
              ENTRAR
            </button>
            <button
              onClick={onGoRegister}
              className="rounded bg-[#D71920] px-4 py-2 font-heading text-xs font-bold tracking-widest text-[#F5F5F5] shadow-lg shadow-[#D71920]/20 transition-all hover:bg-[#A01218]"
            >
              REGISTRARSE
            </button>
              </>
            )}
          </div>
        </div>
      </header>

      <main>
        <section className="relative overflow-hidden border-b border-[#2A2A2A]">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_78%_20%,rgba(215,25,32,0.2),transparent_38%)]" />
          <div className="relative mx-auto max-w-[1280px] px-6 py-14 md:py-18">
            <div className="mb-5 flex items-center gap-3">
              <span className="h-px w-10 bg-[#D71920]" />
              <span className="font-heading text-[10px] font-bold tracking-[0.3em] text-[#D71920]">
                REGISTRO DE COMPETIDORES
              </span>
            </div>
            <div className="flex flex-col justify-between gap-7 md:flex-row md:items-end">
              <div>
                <h1 className="font-heading text-4xl font-black uppercase leading-tight tracking-tight md:text-5xl">
                  Inscribe tu <span className="text-[#D99024]">gallo</span>
                </h1>
                <p className="mt-4 max-w-2xl text-base leading-7 text-[#A3A3A3]">
                  Completa la ficha del competidor para incorporarlo a tu gallera y tenerlo listo
                  para próximos eventos.
                </p>
              </div>
              <div className="flex items-center gap-3 rounded-xl border border-[#176B45]/40 bg-[#176B45]/10 px-5 py-3">
                <span className="h-2 w-2 rounded-full bg-[#4FA77C]" />
                <span className="font-heading text-[10px] font-bold tracking-widest text-[#4FA77C]">
                  REGISTRO HABILITADO
                </span>
              </div>
            </div>
          </div>
        </section>

        <section className="mx-auto grid max-w-[1280px] gap-6 px-6 py-10 lg:grid-cols-[0.72fr_1.28fr]">
          <aside className="h-fit overflow-hidden rounded-2xl border border-[#2A2A2A] bg-[#171717] lg:sticky lg:top-24">
            <div className="border-b border-[#2A2A2A] p-6">
              <span className="font-heading text-[10px] font-bold tracking-[0.25em] text-[#D99024]">
                FOTO DEL COMPETIDOR
              </span>
              <h2 className="mt-2 font-heading text-xl font-black uppercase">Perfil del gallo</h2>
            </div>

            <div className="p-6">
              <label className="group block cursor-pointer">
                <input type="file" accept="image/png,image/jpeg,image/webp" onChange={handlePhoto} className="sr-only" />
                <div className="relative aspect-[4/3] overflow-hidden rounded-xl border border-dashed border-[#444] bg-[#0F0F0F] transition-all group-hover:border-[#D71920]">
                  {photo ? (
                    <>
                      <img src={photo} alt="Vista previa del gallo" className="h-full w-full object-cover" />
                      <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/90 to-transparent px-4 pb-4 pt-10">
                        <span className="font-heading text-[10px] font-bold tracking-widest text-[#F5F5F5]">
                          CAMBIAR FOTO
                        </span>
                      </div>
                    </>
                  ) : (
                    <div className="flex h-full flex-col items-center justify-center px-8 text-center text-[#A3A3A3]">
                      <span className="mb-4 flex h-14 w-14 items-center justify-center rounded-full border border-[#D71920]/30 bg-[#D71920]/10 text-[#D71920]">
                        <IconUpload />
                      </span>
                      <strong className="font-heading text-xs font-black uppercase tracking-wider text-[#F5F5F5]">
                        Sube una foto
                      </strong>
                      <span className="mt-2 text-xs leading-5">
                        JPG, PNG o WEBP
                        <br />
                        Imagen clara y reciente
                      </span>
                    </div>
                  )}
                </div>
              </label>
              {photoName && <p className="mt-3 truncate text-xs text-[#A3A3A3]">{photoName}</p>}

              <div className="mt-6 border-t border-[#2A2A2A] pt-6">
                <h3 className="font-heading text-xs font-black uppercase tracking-wider">Antes de enviar</h3>
                <ul className="mt-4 space-y-3 text-xs leading-5 text-[#A3A3A3]">
                  <li className="flex gap-3">
                    <span className="mt-2 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-[#D99024]" />
                    Verifica que el número de anillo o placa sea correcto.
                  </li>
                  <li className="flex gap-3">
                    <span className="mt-2 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-[#D99024]" />
                    Registra el peso actual del competidor.
                  </li>
                  <li className="flex gap-3">
                    <span className="mt-2 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-[#D99024]" />
                    Usa una fotografía donde el gallo sea claramente visible.
                  </li>
                </ul>
              </div>
            </div>
          </aside>

          <form onSubmit={handleSubmit} className="rounded-2xl border border-[#2A2A2A] bg-[#171717]">
            <div className="flex items-center justify-between gap-5 border-b border-[#2A2A2A] p-6 md:p-8">
              <div>
                <span className="font-heading text-[10px] font-bold tracking-[0.25em] text-[#D71920]">
                  INFORMACIÓN GENERAL
                </span>
                <h2 className="mt-2 font-heading text-xl font-black uppercase md:text-2xl">
                  Ficha de inscripción
                </h2>
              </div>
              <span className="hidden text-xs text-[#666] sm:block">Todos los campos son obligatorios</span>
            </div>

            {error && <p role="alert" className="mx-6 mt-6 rounded-xl border border-[#D71920]/40 bg-[#D71920]/10 p-3 text-sm text-[#F5A0A3] md:mx-8">{error}</p>}
            <div className="grid gap-5 p-6 md:grid-cols-2 md:p-8">
              <div className="md:col-span-2">
                <label htmlFor="rooster-name" className="mb-2 block font-heading text-[10px] font-bold tracking-widest text-[#A3A3A3]">
                  NOMBRE O CÓDIGO DEL GALLO
                </label>
                <input
                  id="rooster-name"
                  value={form.name}
                  onChange={event => updateField('name', event.target.value)}
                  placeholder="Ej. Relámpago / GAL-024"
                  required
                  className="w-full rounded-xl border border-[#2A2A2A] bg-[#0F0F0F] px-4 py-3.5 text-sm text-[#F5F5F5] outline-none transition-colors placeholder:text-[#555] focus:border-[#D71920]"
                />
              </div>

              <div>
                <label htmlFor="rooster-ring" className="mb-2 block font-heading text-[10px] font-bold tracking-widest text-[#A3A3A3]">
                  NÚMERO DE ANILLO / PLACA
                </label>
                <input
                  id="rooster-ring"
                  value={form.ring}
                  onChange={event => updateField('ring', event.target.value)}
                  placeholder="Ej. AN-458921"
                  required
                  className="w-full rounded-xl border border-[#2A2A2A] bg-[#0F0F0F] px-4 py-3.5 text-sm text-[#F5F5F5] outline-none transition-colors placeholder:text-[#555] focus:border-[#D71920]"
                />
              </div>

              <div>
                <label htmlFor="rooster-breed" className="mb-2 block font-heading text-[10px] font-bold tracking-widest text-[#A3A3A3]">
                  RAZA O CASTA
                </label>
                <input
                  id="rooster-breed"
                  value={form.breed}
                  onChange={event => updateField('breed', event.target.value)}
                  placeholder="Ej. Kelso"
                  required
                  className="w-full rounded-xl border border-[#2A2A2A] bg-[#0F0F0F] px-4 py-3.5 text-sm text-[#F5F5F5] outline-none transition-colors placeholder:text-[#555] focus:border-[#D71920]"
                />
              </div>

              <div>
                <label htmlFor="rooster-weight" className="mb-2 block font-heading text-[10px] font-bold tracking-widest text-[#A3A3A3]">
                  PESO (KG)
                </label>
                <input
                  id="rooster-weight"
                  type="number"
                  min="0.1"
                  step="0.01"
                  value={form.weight}
                  onChange={event => updateField('weight', event.target.value)}
                  placeholder="Ej. 2.15"
                  required
                  className="w-full rounded-xl border border-[#2A2A2A] bg-[#0F0F0F] px-4 py-3.5 text-sm text-[#F5F5F5] outline-none transition-colors placeholder:text-[#555] focus:border-[#D71920]"
                />
              </div>

              <div>
                <label htmlFor="rooster-age" className="mb-2 block font-heading text-[10px] font-bold tracking-widest text-[#A3A3A3]">
                  EDAD (MESES)
                </label>
                <input
                  id="rooster-age"
                  type="number"
                  min="1"
                  step="1"
                  value={form.age}
                  onChange={event => updateField('age', event.target.value)}
                  placeholder="Ej. 18"
                  required
                  className="w-full rounded-xl border border-[#2A2A2A] bg-[#0F0F0F] px-4 py-3.5 text-sm text-[#F5F5F5] outline-none transition-colors placeholder:text-[#555] focus:border-[#D71920]"
                />
              </div>

              <div>
                <label htmlFor="rooster-arena" className="mb-2 block font-heading text-[10px] font-bold tracking-widest text-[#A3A3A3]">
                  GALLERA
                </label>
                <input
                  id="rooster-arena"
                  value={form.arena}
                  onChange={event => updateField('arena', event.target.value)}
                  placeholder="Ej. Gallera San Miguel"
                  required
                  className="w-full rounded-xl border border-[#2A2A2A] bg-[#0F0F0F] px-4 py-3.5 text-sm text-[#F5F5F5] outline-none transition-colors placeholder:text-[#555] focus:border-[#D71920]"
                />
              </div>

              <div>
                <label htmlFor="rooster-wins" className="mb-2 block font-heading text-[10px] font-bold tracking-widest text-[#A3A3A3]">
                  VICTORIAS
                </label>
                <input
                  id="rooster-wins"
                  type="number"
                  min="0"
                  step="1"
                  value={form.wins}
                  onChange={event => updateField('wins', event.target.value)}
                  placeholder="Ej. 4"
                  required
                  className="w-full rounded-xl border border-[#2A2A2A] bg-[#0F0F0F] px-4 py-3.5 text-sm text-[#F5F5F5] outline-none transition-colors placeholder:text-[#555] focus:border-[#D71920]"
                />
              </div>
            </div>

            <div className="flex flex-col-reverse gap-3 border-t border-[#2A2A2A] p-6 sm:flex-row sm:items-center sm:justify-between md:px-8">
              <p className="text-xs leading-5 text-[#666]">
                Al guardar confirmas que la información suministrada es correcta.
              </p>
              <button
                type="submit"
                disabled={loading}
                className="flex flex-shrink-0 items-center justify-center gap-2 rounded-lg bg-[#D71920] px-7 py-3.5 font-heading text-xs font-black tracking-widest text-[#F5F5F5] shadow-lg shadow-[#D71920]/20 transition-all hover:-translate-y-0.5 hover:bg-[#A01218]"
              >
                {loading ? 'GUARDANDO…' : 'INSCRIBIR GALLO'}
                {!loading && <span aria-hidden="true">→</span>}
              </button>
            </div>
          </form>
        </section>

        {submitted && (
          <section id="registro-confirmado" className="mx-auto max-w-[1280px] scroll-mt-24 px-6 pb-14">
            <div className="overflow-hidden rounded-2xl border border-[#176B45]/50 bg-[#176B45]/10">
              <div className="flex flex-col gap-6 p-7 md:flex-row md:items-center md:p-9">
                <div className="flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-full bg-[#176B45] text-[#F5F5F5]">
                  <IconCheck />
                </div>
                <div className="flex-1">
                  <span className="font-heading text-[10px] font-bold tracking-[0.25em] text-[#4FA77C]">
                    REGISTRO COMPLETADO
                  </span>
                  <h2 className="mt-2 font-heading text-2xl font-black uppercase">
                    {submitted.name} ya está inscrito
                  </h2>
                  <p className="mt-2 text-sm leading-6 text-[#A3A3A3]">
                    Anillo {submitted.ring} · {submitted.breed} · {submitted.weight} kg · {submitted.wins}{' '}
                    victorias
                  </p>
                </div>
                <button
                  onClick={onGoRoosterDirectory}
                  className="rounded-lg bg-[#176B45] px-5 py-3 font-heading text-xs font-black tracking-widest text-[#F5F5F5] transition-colors hover:bg-[#145D3C]"
                >
                  VER GALLOS
                </button>
                <button
                  onClick={resetForm}
                  className="rounded-lg border border-[#176B45] px-5 py-3 font-heading text-xs font-black tracking-widest text-[#4FA77C] transition-colors hover:bg-[#176B45] hover:text-[#F5F5F5]"
                >
                  INSCRIBIR OTRO
                </button>
              </div>
            </div>
          </section>
        )}
      </main>

      <footer className="border-t border-[#1F1F1F] px-6 py-7">
        <div className="mx-auto flex max-w-[1440px] flex-wrap items-center justify-between gap-4">
          <button onClick={onBack} className="flex items-center gap-3">
            <RoosterLogo size={24} />
            <span className="font-heading text-sm font-black tracking-wider text-[#A3A3A3]">
              GALLER<span className="text-[#D71920]">APP</span>
            </span>
          </button>
          <p className="font-heading text-[10px] tracking-widest text-[#555]">
            © 2026 GallerApp · REGISTRO DE COMPETIDORES
          </p>
        </div>
      </footer>
    </div>
  )
}
