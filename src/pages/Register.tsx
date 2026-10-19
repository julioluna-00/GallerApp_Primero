import { useState } from 'react'
import { RoosterLogo } from '../components/RoosterLogo'
import { apiRequest } from '../lib/api'

interface RegisterProps {
  onBack: () => void
  onGoLogin: () => void
}

const steps = ['CUENTA', 'PERSONAL', 'CONFIRMACIÓN']

export default function Register({ onBack, onGoLogin }: RegisterProps) {
  const [step, setStep] = useState(0)
  const [loading, setLoading] = useState(false)
  const [done, setDone] = useState(false)
  const [showPass, setShowPass] = useState(false)
  const [error, setError] = useState('')

  const [form, setForm] = useState({
    email: '', password: '', confirm: '',
    nombre: '', apellido: '', telefono: '', pais: 'Colombia',
    fecha: '', documento: '', acepta: false, mayores: false,
  })

  function set(field: string, value: string | boolean) {
    setForm(prev => ({ ...prev, [field]: value }))
  }

  function next() {
    if (step < 2) setStep(s => s + 1)
  }
  function prev() {
    if (step > 0) setStep(s => s - 1)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (step < 2) { next(); return }
    if (form.password !== form.confirm) { setError('Las contraseñas no coinciden.'); return }
    setLoading(true)
    setError('')
    try {
      await apiRequest('/auth/register', form)
      setDone(true)
    } catch (err) {
      const message = err instanceof Error ? err.message : 'No fue posible crear la cuenta.'
      setError(message)
      if (/c[eé]dula o pasaporte/i.test(message)) setStep(1)
    } finally { setLoading(false) }
  }

  if (done) {
    return (
      <div className="min-h-screen bg-[#0B0B0B] flex flex-col">
        <header className="border-b border-[#D71920]/20 px-6 h-16 flex items-center">
          <button onClick={onBack} className="flex items-center gap-3 group">
            <RoosterLogo size={32} />
            <span className="font-heading font-black text-lg tracking-wider text-[#F5F5F5]">
              GALLER<span className="text-[#D71920]">APP</span>
            </span>
          </button>
        </header>
        <div className="flex-1 flex items-center justify-center px-4">
          <div className="text-center max-w-sm">
            <div className="w-20 h-20 rounded-full bg-[#176B45]/20 border border-[#176B45]/40 flex items-center justify-center mx-auto mb-6">
              <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#176B45" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="20 6 9 17 4 12" />
              </svg>
            </div>
            <h2 className="font-heading font-black text-2xl text-[#F5F5F5] tracking-wider mb-2">¡CUENTA CREADA!</h2>
            <p className="text-[#A3A3A3] text-sm mb-8">Tu cuenta en GallerApp ha sido creada exitosamente. Ya puedes disfrutar de todas las peleas en vivo.</p>
            <button onClick={onGoLogin}
              className="w-full py-3.5 bg-[#D71920] hover:bg-[#A01218] text-[#F5F5F5] font-heading font-black text-sm tracking-widest rounded-xl transition-all duration-200 shadow-lg shadow-[#D71920]/20">
              INGRESAR AHORA
            </button>
            <button onClick={onBack} className="mt-4 w-full text-xs text-[#555] hover:text-[#A3A3A3] transition-colors font-heading tracking-wider">
              IR AL INICIO
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#0B0B0B] flex flex-col">

      {/* Header minimal */}
      <header className="border-b border-[#D71920]/20 px-6 h-16 flex items-center">
        <button onClick={onBack} className="flex items-center gap-3 group">
          <RoosterLogo size={32} />
          <span className="font-heading font-black text-lg tracking-wider text-[#F5F5F5] group-hover:text-[#D71920] transition-colors">
            GALLER<span className="text-[#D71920] group-hover:text-[#F5F5F5]">APP</span>
          </span>
        </button>
      </header>

      <div className="flex-1 flex items-center justify-center px-4 py-10">
        <div className="w-full max-w-lg">

          {/* Stepper */}
          <div className="flex items-center justify-center gap-0 mb-8">
            {steps.map((label, i) => (
              <div key={label} className="flex items-center">
                <div className="flex flex-col items-center gap-1.5">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-heading font-black transition-all duration-300
                    ${i < step ? 'bg-[#176B45] border-2 border-[#176B45] text-white'
                      : i === step ? 'bg-[#D71920] border-2 border-[#D71920] text-white shadow-lg shadow-[#D71920]/30'
                      : 'bg-[#171717] border-2 border-[#2A2A2A] text-[#555]'}`}>
                    {i < step ? (
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                    ) : i + 1}
                  </div>
                  <span className={`text-[9px] font-heading font-bold tracking-widest ${i === step ? 'text-[#D71920]' : i < step ? 'text-[#176B45]' : 'text-[#555]'}`}>
                    {label}
                  </span>
                </div>
                {i < steps.length - 1 && (
                  <div className={`w-16 h-px mx-2 mb-4 transition-all duration-300 ${i < step ? 'bg-[#176B45]' : 'bg-[#2A2A2A]'}`} />
                )}
              </div>
            ))}
          </div>

          {/* Card */}
          <div className="bg-[#171717] border border-[#2A2A2A] rounded-2xl p-8 shadow-2xl shadow-black/60">

            <div className="mb-6">
              <h1 className="font-heading font-black text-xl tracking-wider text-[#F5F5F5]">
                {step === 0 && 'CREA TU CUENTA'}
                {step === 1 && 'DATOS PERSONALES'}
                {step === 2 && 'CONFIRMACIÓN'}
              </h1>
              <p className="text-xs text-[#A3A3A3] mt-1">
                {step === 0 && 'Elige tu correo y contraseña de acceso'}
                {step === 1 && 'Necesitamos algunos datos adicionales'}
                {step === 2 && 'Revisa y acepta los términos para continuar'}
              </p>
            </div>

            <form onSubmit={handleSubmit} className="flex flex-col gap-4">

              {/* STEP 0: Cuenta */}
              {step === 0 && (
                <>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] font-heading font-bold tracking-widest text-[#A3A3A3]">CORREO ELECTRÓNICO</label>
                    <input type="email" value={form.email} onChange={e => set('email', e.target.value)}
                      placeholder="tucorreo@ejemplo.com" required
                      className="w-full bg-[#0F0F0F] border border-[#2A2A2A] rounded-xl px-4 py-3 text-sm text-[#F5F5F5] placeholder:text-[#444] outline-none focus:border-[#D71920] transition-colors" />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] font-heading font-bold tracking-widest text-[#A3A3A3]">CONTRASEÑA</label>
                    <div className="relative">
                      <input type={showPass ? 'text' : 'password'} value={form.password} onChange={e => set('password', e.target.value)}
                        placeholder="Mínimo 8 caracteres" required
                        className="w-full bg-[#0F0F0F] border border-[#2A2A2A] rounded-xl px-4 py-3 pr-12 text-sm text-[#F5F5F5] placeholder:text-[#444] outline-none focus:border-[#D71920] transition-colors" />
                      <button type="button" onClick={() => setShowPass(p => !p)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-[#555] hover:text-[#A3A3A3] transition-colors text-xs font-heading font-bold tracking-wider">
                        {showPass ? 'OCULTAR' : 'VER'}
                      </button>
                    </div>
                    {/* Password strength */}
                    {form.password.length > 0 && (
                      <div className="flex gap-1 mt-1">
                        {[4, 6, 8].map((min, i) => (
                          <div key={i} className={`flex-1 h-1 rounded-full transition-all ${
                            form.password.length >= min
                              ? i === 0 ? 'bg-[#D71920]' : i === 1 ? 'bg-[#D99024]' : 'bg-[#176B45]'
                              : 'bg-[#2A2A2A]'}`} />
                        ))}
                        <span className="text-[10px] text-[#A3A3A3] font-heading ml-1">
                          {form.password.length < 4 ? 'Débil' : form.password.length < 6 ? 'Regular' : form.password.length < 8 ? 'Buena' : 'Fuerte'}
                        </span>
                      </div>
                    )}
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] font-heading font-bold tracking-widest text-[#A3A3A3]">CONFIRMAR CONTRASEÑA</label>
                    <input type="password" value={form.confirm} onChange={e => set('confirm', e.target.value)}
                      placeholder="Repite tu contraseña" required
                      className={`w-full bg-[#0F0F0F] border rounded-xl px-4 py-3 text-sm text-[#F5F5F5] placeholder:text-[#444] outline-none transition-colors
                        ${form.confirm && form.confirm !== form.password ? 'border-[#D71920]' : form.confirm && form.confirm === form.password ? 'border-[#176B45]' : 'border-[#2A2A2A] focus:border-[#D71920]'}`} />
                    {form.confirm && form.confirm !== form.password && (
                      <p className="text-[10px] text-[#D71920] font-heading">Las contraseñas no coinciden</p>
                    )}
                  </div>
                </>
              )}

              {/* STEP 1: Personal */}
              {step === 1 && (
                <>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="flex flex-col gap-1.5">
                      <label className="text-[10px] font-heading font-bold tracking-widest text-[#A3A3A3]">NOMBRE</label>
                      <input type="text" value={form.nombre} onChange={e => set('nombre', e.target.value)}
                        placeholder="Juan" required
                        className="w-full bg-[#0F0F0F] border border-[#2A2A2A] rounded-xl px-4 py-3 text-sm text-[#F5F5F5] placeholder:text-[#444] outline-none focus:border-[#D71920] transition-colors" />
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <label className="text-[10px] font-heading font-bold tracking-widest text-[#A3A3A3]">APELLIDO</label>
                      <input type="text" value={form.apellido} onChange={e => set('apellido', e.target.value)}
                        placeholder="García" required
                        className="w-full bg-[#0F0F0F] border border-[#2A2A2A] rounded-xl px-4 py-3 text-sm text-[#F5F5F5] placeholder:text-[#444] outline-none focus:border-[#D71920] transition-colors" />
                    </div>
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] font-heading font-bold tracking-widest text-[#A3A3A3]">TELÉFONO</label>
                    <div className="flex gap-2">
                      <div className="flex items-center gap-2 px-3 bg-[#0F0F0F] border border-[#2A2A2A] rounded-xl text-sm text-[#A3A3A3] font-heading font-bold flex-shrink-0">
                        🇨🇴 +57
                      </div>
                      <input type="tel" value={form.telefono} onChange={e => set('telefono', e.target.value)}
                        placeholder="300 123 4567" required
                        className="flex-1 bg-[#0F0F0F] border border-[#2A2A2A] rounded-xl px-4 py-3 text-sm text-[#F5F5F5] placeholder:text-[#444] outline-none focus:border-[#D71920] transition-colors" />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="flex flex-col gap-1.5">
                      <label className="text-[10px] font-heading font-bold tracking-widest text-[#A3A3A3]">FECHA DE NACIMIENTO</label>
                      <input type="date" value={form.fecha} onChange={e => set('fecha', e.target.value)} required
                        className="w-full bg-[#0F0F0F] border border-[#2A2A2A] rounded-xl px-4 py-3 text-sm text-[#F5F5F5] outline-none focus:border-[#D71920] transition-colors [color-scheme:dark]" />
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <label className="text-[10px] font-heading font-bold tracking-widest text-[#A3A3A3]">PAÍS</label>
                      <select value={form.pais} onChange={e => set('pais', e.target.value)}
                        className="w-full bg-[#0F0F0F] border border-[#2A2A2A] rounded-xl px-4 py-3 text-sm text-[#F5F5F5] outline-none focus:border-[#D71920] transition-colors">
                        {['Colombia', 'México', 'Venezuela', 'Perú', 'Ecuador', 'Guatemala', 'Honduras', 'El Salvador', 'Otro'].map(p => (
                          <option key={p} value={p}>{p}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] font-heading font-bold tracking-widest text-[#A3A3A3]">NÚMERO DE DOCUMENTO</label>
                    <input type="text" value={form.documento} onChange={e => { set('documento', e.target.value); setError('') }}
                      placeholder="Cédula o pasaporte" required maxLength={40} autoComplete="off"
                      className="w-full bg-[#0F0F0F] border border-[#2A2A2A] rounded-xl px-4 py-3 text-sm text-[#F5F5F5] placeholder:text-[#444] outline-none focus:border-[#D71920] transition-colors" />
                    <p className="text-[10px] text-[#777]">Este documento solo puede estar asociado a una cuenta.</p>
                  </div>
                </>
              )}

              {/* STEP 2: Confirmación */}
              {step === 2 && (
                <>
                  {/* Resumen */}
                  <div className="bg-[#0F0F0F] border border-[#2A2A2A] rounded-xl p-4 flex flex-col gap-3">
                    <p className="text-[10px] font-heading font-bold tracking-widest text-[#A3A3A3] mb-1">RESUMEN DE CUENTA</p>
                    {[
                      { label: 'Correo', value: form.email || '—' },
                      { label: 'Nombre', value: `${form.nombre} ${form.apellido}`.trim() || '—' },
                      { label: 'Teléfono', value: form.telefono || '—' },
                      { label: 'País', value: form.pais },
                    ].map(({ label, value }) => (
                      <div key={label} className="flex items-center justify-between">
                        <span className="text-xs text-[#A3A3A3] font-heading">{label}</span>
                        <span className="text-xs text-[#F5F5F5] font-heading font-semibold">{value}</span>
                      </div>
                    ))}
                  </div>

                  <label className="flex items-start gap-3 cursor-pointer group p-3 rounded-xl bg-[#0F0F0F] border border-[#2A2A2A] hover:border-[#333] transition-colors">
                    <input type="checkbox" checked={form.acepta} onChange={e => set('acepta', e.target.checked)} required
                      className="w-4 h-4 accent-[#D71920] cursor-pointer mt-0.5 flex-shrink-0" />
                    <span className="text-xs text-[#A3A3A3] leading-relaxed">
                      Acepto los{' '}
                      <span className="text-[#D71920] font-semibold cursor-pointer hover:underline">Términos y Condiciones</span>
                      {' '}y la{' '}
                      <span className="text-[#D71920] font-semibold cursor-pointer hover:underline">Política de Privacidad</span>
                      {' '}de GallerApp.
                    </span>
                  </label>

                  <label className="flex items-start gap-3 cursor-pointer group p-3 rounded-xl bg-[#0F0F0F] border border-[#2A2A2A] hover:border-[#333] transition-colors">
                    <input type="checkbox" checked={form.mayores} onChange={e => set('mayores', e.target.checked)} required
                      className="w-4 h-4 accent-[#D71920] cursor-pointer mt-0.5 flex-shrink-0" />
                    <span className="text-xs text-[#A3A3A3] leading-relaxed">
                      Confirmo que soy mayor de <strong className="text-[#F5F5F5]">18 años</strong> y que las apuestas están permitidas en mi jurisdicción.
                    </span>
                  </label>

                  <div className="p-3 rounded-xl bg-[#D99024]/5 border border-[#D99024]/20 flex items-start gap-2">
                    <span className="text-[#D99024] text-sm mt-0.5">⚠</span>
                    <p className="text-[10px] text-[#A3A3A3] leading-relaxed">
                      GallerApp promueve el juego responsable. Si necesitas ayuda, contacta a nuestro equipo de soporte.
                    </p>
                  </div>
                </>
              )}

              {/* Navigation buttons */}
              {error && <p role="alert" className="rounded-xl border border-[#D71920]/40 bg-[#D71920]/10 px-4 py-3 text-sm text-[#F5A0A3]">{error}</p>}
              <div className="flex gap-3 mt-2">
                {step > 0 && (
                  <button type="button" onClick={prev}
                    className="flex-1 py-3.5 bg-transparent border border-[#2A2A2A] hover:border-[#444] text-[#A3A3A3] hover:text-[#F5F5F5] font-heading font-black text-sm tracking-widest rounded-xl transition-all duration-200">
                    ATRÁS
                  </button>
                )}
                <button type="submit" disabled={loading}
                  className="flex-1 py-3.5 bg-[#D71920] hover:bg-[#A01218] disabled:opacity-60 text-[#F5F5F5] font-heading font-black text-sm tracking-widest rounded-xl transition-all duration-200 shadow-lg shadow-[#D71920]/20 flex items-center justify-center gap-2">
                  {loading ? (
                    <>
                      <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      CREANDO...
                    </>
                  ) : step < 2 ? 'CONTINUAR' : 'CREAR CUENTA'}
                </button>
              </div>
            </form>

            <p className="text-center text-sm text-[#A3A3A3] mt-5">
              ¿Ya tienes cuenta?{' '}
              <button onClick={onGoLogin} className="text-[#D71920] hover:text-[#F5F5F5] font-heading font-bold transition-colors">
                ENTRAR
              </button>
            </p>
          </div>

          <button onClick={onBack} className="mt-5 w-full text-center text-xs text-[#555] hover:text-[#A3A3A3] transition-colors font-heading tracking-wider">
            ← VOLVER A GALLERAPP
          </button>
        </div>
      </div>
    </div>
  )
}
