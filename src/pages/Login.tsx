import { useState } from 'react'
import { RoosterLogo } from '../components/RoosterLogo'
import { apiRequest, type GallerUser } from '../lib/api'

interface LoginProps {
  onBack: () => void
  onGoRegister: () => void
  onSuccess: (user: GallerUser) => void
}

export default function Login({ onBack, onGoRegister, onSuccess }: LoginProps) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPass, setShowPass] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      const result = await apiRequest<{ token: string; user: GallerUser }>('/auth/login', { email, password })
      sessionStorage.setItem('gallerapp_token', result.token)
      onSuccess(result.user)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No fue posible iniciar sesión.')
    } finally { setLoading(false) }
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

      {/* Content */}
      <div className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md">

          {/* Card */}
          <div className="bg-[#171717] border border-[#2A2A2A] rounded-2xl p-8 shadow-2xl shadow-black/60">

            {/* Title */}
            <div className="mb-8 text-center">
              <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-[#D71920]/10 border border-[#D71920]/20 mb-5">
                <RoosterLogo size={30} />
              </div>
              <h1 className="font-heading font-black text-2xl tracking-wider text-[#F5F5F5] mb-1">BIENVENIDO</h1>
              <p className="text-sm text-[#A3A3A3]">Ingresa a tu cuenta de GallerApp</p>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">

              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-heading font-bold tracking-widest text-[#A3A3A3]">CORREO ELECTRÓNICO</label>
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="tucorreo@ejemplo.com"
                  required
                  className="w-full bg-[#0F0F0F] border border-[#2A2A2A] rounded-xl px-4 py-3 text-sm text-[#F5F5F5] placeholder:text-[#444] outline-none focus:border-[#D71920] transition-colors font-body"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-heading font-bold tracking-widest text-[#A3A3A3]">CONTRASEÑA</label>
                <div className="relative">
                  <input
                    type={showPass ? 'text' : 'password'}
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                    className="w-full bg-[#0F0F0F] border border-[#2A2A2A] rounded-xl px-4 py-3 pr-12 text-sm text-[#F5F5F5] placeholder:text-[#444] outline-none focus:border-[#D71920] transition-colors font-body"
                  />
                  <button type="button" onClick={() => setShowPass(p => !p)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[#555] hover:text-[#A3A3A3] transition-colors text-xs font-heading font-bold tracking-wider">
                    {showPass ? 'OCULTAR' : 'VER'}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <label className="flex items-center gap-2 cursor-pointer group">
                  <input type="checkbox" className="w-3.5 h-3.5 accent-[#D71920] cursor-pointer" />
                  <span className="text-xs text-[#A3A3A3] group-hover:text-[#F5F5F5] transition-colors">Recordarme</span>
                </label>
                <button type="button" className="text-xs text-[#D71920] hover:text-[#F5F5F5] transition-colors font-heading font-semibold">
                  ¿Olvidaste tu contraseña?
                </button>
              </div>

              {error && <p role="alert" className="rounded-xl border border-[#D71920]/40 bg-[#D71920]/10 px-4 py-3 text-sm text-[#F5A0A3]">{error}</p>}

              <button type="submit" disabled={loading}
                className="w-full py-3.5 bg-[#D71920] hover:bg-[#A01218] disabled:opacity-60 text-[#F5F5F5] font-heading font-black text-sm tracking-widest rounded-xl transition-all duration-200 shadow-lg shadow-[#D71920]/20 mt-2 flex items-center justify-center gap-2">
                {loading ? (
                  <>
                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    INGRESANDO...
                  </>
                ) : 'ENTRAR'}
              </button>

            </form>

            {/* Divider */}
            <div className="flex items-center gap-3 my-6">
              <div className="flex-1 h-px bg-[#2A2A2A]" />
              <span className="text-[10px] font-heading text-[#555] tracking-widest">O CONTINÚA CON</span>
              <div className="flex-1 h-px bg-[#2A2A2A]" />
            </div>

            {/* Social */}
            <div className="grid grid-cols-2 gap-3">
              {['Google', 'Facebook'].map(provider => (
                <button key={provider}
                  className="flex items-center justify-center gap-2 py-2.5 bg-[#0F0F0F] border border-[#2A2A2A] rounded-xl text-xs font-heading font-bold text-[#A3A3A3] hover:border-[#444] hover:text-[#F5F5F5] transition-all">
                  {provider === 'Google' ? (
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                    </svg>
                  ) : (
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="#1877F2">
                      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                    </svg>
                  )}
                  {provider}
                </button>
              ))}
            </div>

            {/* Register link */}
            <p className="text-center text-sm text-[#A3A3A3] mt-6">
              ¿No tienes cuenta?{' '}
              <button onClick={onGoRegister} className="text-[#D71920] hover:text-[#F5F5F5] font-heading font-bold transition-colors">
                REGÍSTRATE
              </button>
            </p>
          </div>

          {/* Back */}
          <button onClick={onBack} className="mt-5 w-full text-center text-xs text-[#555] hover:text-[#A3A3A3] transition-colors font-heading tracking-wider">
            ← VOLVER A GALLERAPP
          </button>
        </div>
      </div>
    </div>
  )
}
