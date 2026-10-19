import { RoosterLogo } from '../components/RoosterLogo'

interface AboutProps {
  signedInUser: { nombre: string; apellido: string; role: 'administrador' | 'usuario'; profileImage?: string } | null
  onBack: () => void
  onGoEvents: () => void
  onGoRegisterRooster: () => void
  onGoRoosters: () => void
  onGoRoosterDirectory: () => void
  onGoAdmin: () => void
  onGoLogin: () => void
  onGoRegister: () => void
  onGoProfile: () => void
  onLogout: () => void
}

const stats = [
  { value: '+50', label: 'peleas por semana' },
  { value: 'HD', label: 'transmisión en vivo' },
  { value: 'Rápido', label: 'retiro de ganancias' },
  { value: '24/7', label: 'soporte al jugador' },
]

const benefits = [
  {
    number: '01',
    title: 'Directo sin retrasos',
    description: 'Cámaras en el palenque y apuestas abiertas mientras se prepara cada pelea.',
  },
  {
    number: '02',
    title: 'Cuotas claras',
    description: 'Ves cuánto puedes ganar antes de confirmar. Sin sorpresas ni letra pequeña.',
  },
  {
    number: '03',
    title: 'Pagos ágiles',
    description: 'Deposita y retira tus ganancias con métodos locales de uso común.',
  },
]

const steps = [
  { title: 'Regístrate', description: 'Crea tu cuenta con tus datos reales.' },
  { title: 'Verifica', description: 'Confirmamos que eres mayor de edad.' },
  { title: 'Recarga', description: 'Elige tu monto y método de pago.' },
  { title: 'Apuesta en vivo', description: 'Escoge tu gallo y sigue la pelea.' },
]

export default function About({ signedInUser, onBack, onGoEvents, onGoRoosters, onGoRegisterRooster, onGoRoosterDirectory, onGoAdmin, onGoLogin, onGoRegister, onGoProfile, onLogout }: AboutProps) {
  function scrollToStory() {
    document.getElementById('historia')?.scrollIntoView({ behavior: 'smooth' })
  }

  return (
    <div className="min-h-screen overflow-x-hidden bg-[#0B0B0B] text-[#F5F5F5] font-body">
      <header className="sticky top-0 z-50 border-b border-[#D71920]/20 bg-[#0B0B0B]/95 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-[1440px] items-center justify-between gap-6 px-6">
          <button onClick={onBack} className="group flex flex-shrink-0 items-center gap-3">
            <RoosterLogo size={38} />
            <span className="font-heading text-xl font-black tracking-wider text-[#F5F5F5] transition-colors group-hover:text-[#D71920]">
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
            <button
              onClick={onGoRegisterRooster}
              className="rounded px-4 py-2 font-heading text-xs font-semibold tracking-widest text-[#A3A3A3] transition-colors hover:bg-[#171717] hover:text-[#F5F5F5]"
            >
              INSCRIBE TU GALLO
            </button>
            <button
              onClick={onGoRoosterDirectory}
              className="rounded px-4 py-2 font-heading text-xs font-semibold tracking-widest text-[#A3A3A3] transition-colors hover:bg-[#171717] hover:text-[#F5F5F5]"
            >
              GALLOS
            </button>
            <button className="rounded bg-[#171717] px-4 py-2 font-heading text-xs font-semibold tracking-widest text-[#F5F5F5]">
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
                {signedInUser.role === 'administrador' && <button onClick={onGoAdmin} className="rounded bg-[#D71920] px-3 py-2 font-heading text-[9px] font-black tracking-wider text-white sm:px-4 sm:text-[10px]">PANEL ADMIN</button>}
                <button onClick={onGoProfile} className="hidden rounded border border-[#2A2A2A] px-3 py-2 font-heading text-[10px] font-bold tracking-wider text-[#A3A3A3] hover:text-white md:block">MI PERFIL</button>
                <button onClick={onLogout} className="rounded border border-[#2A2A2A] px-3 py-2 font-heading text-[10px] font-bold tracking-wider text-[#A3A3A3] hover:text-white">SALIR</button>
              </>
            ) : (
              <>
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
        <nav className="flex items-center justify-start gap-1 overflow-x-auto border-t border-[#1D1D1D] px-3 py-2 md:hidden">
          <button onClick={onBack} className="whitespace-nowrap px-2 py-1 font-heading text-[9px] font-bold tracking-wider text-[#777]">PELEAS</button>
          <button onClick={onGoEvents} className="whitespace-nowrap px-2 py-1 font-heading text-[9px] font-bold tracking-wider text-[#777]">EVENTOS</button>
          <button onClick={onGoRegisterRooster} className="whitespace-nowrap px-2 py-1 font-heading text-[9px] font-bold tracking-wider text-[#777]">INSCRIBE TU GALLO</button>
          <button onClick={onGoRoosterDirectory} className="whitespace-nowrap px-2 py-1 font-heading text-[9px] font-bold tracking-wider text-[#777]">GALLOS</button>
        </nav>
      </header>

      <main>
        <section className="relative isolate overflow-hidden border-b border-[#D99024]/30">
          <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_80%_50%,rgba(215,25,32,0.28),transparent_42%)]" />
          <div className="absolute left-0 top-0 -z-10 h-full w-1 bg-[#D71920]" />
          <div className="mx-auto grid max-w-[1280px] items-center gap-14 px-6 py-20 md:grid-cols-[1.15fr_0.85fr] md:py-28">
            <div>
              <div className="mb-7 inline-flex items-center gap-2 rounded-full border border-[#D71920]/40 bg-[#D71920]/10 px-4 py-2">
                <span className="relative flex h-2 w-2">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#D71920] opacity-75" />
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-[#D71920]" />
                </span>
                <span className="font-heading text-[10px] font-bold tracking-[0.22em] text-[#D71920]">
                  EN VIVO DESDE LA GALLERA
                </span>
              </div>
              <h1 className="max-w-3xl font-heading text-4xl font-black uppercase leading-[1.03] tracking-tight text-[#F5F5F5] md:text-6xl">
                Siente el ruedo.
                <span className="block text-[#D99024]">Apuesta en tiempo real.</span>
              </h1>
              <p className="mt-7 max-w-2xl text-base leading-8 text-[#A3A3A3] md:text-lg">
                Somos la plataforma que lleva las peleas en directo a tu pantalla: cámaras en el
                palenque, cuotas que se mueven con la pelea y pagos rápidos cuando aciertas.
              </p>
              <div className="mt-9 flex flex-wrap gap-3">
                <button
                  onClick={onGoRegister}
                  className="rounded-lg bg-[#D71920] px-7 py-3.5 font-heading text-xs font-black tracking-widest text-[#F5F5F5] shadow-xl shadow-[#D71920]/20 transition-all hover:-translate-y-0.5 hover:bg-[#A01218]"
                >
                  CREAR MI CUENTA
                </button>
                <button
                  onClick={scrollToStory}
                  className="rounded-lg border border-[#F5F5F5]/30 px-7 py-3.5 font-heading text-xs font-black tracking-widest text-[#F5F5F5] transition-all hover:border-[#D99024] hover:text-[#D99024]"
                >
                  CONÓCENOS
                </button>
              </div>
            </div>

            <div className="relative mx-auto flex aspect-square w-full max-w-sm items-center justify-center">
              <div className="absolute inset-4 rounded-full border border-[#D99024]/20" />
              <div className="absolute inset-10 rounded-full border border-dashed border-[#D99024]/30" />
              <div className="absolute inset-16 rounded-full bg-gradient-to-br from-[#D71920] to-[#4A090C] shadow-[0_0_80px_rgba(215,25,32,0.28)]" />
              <div className="relative z-10 text-center">
                <RoosterLogo size={104} />
                <strong className="mt-2 block font-heading text-5xl font-black text-[#D99024]">24/7</strong>
                <span className="mt-2 block font-heading text-xs font-semibold uppercase leading-5 tracking-widest text-[#F5F5F5]">
                  Cartelera y transmisión
                  <br />
                  en directo
                </span>
              </div>
            </div>
          </div>
        </section>

        <section id="historia" className="mx-auto max-w-[1280px] scroll-mt-24 px-6 py-20">
          <div className="mb-12 flex items-center gap-4">
            <span className="h-px w-12 bg-[#D71920]" />
            <span className="font-heading text-[10px] font-bold tracking-[0.3em] text-[#D71920]">
              NUESTRA ESENCIA
            </span>
          </div>
          <div className="grid gap-14 md:grid-cols-2">
            <article>
              <h2 className="font-heading text-3xl font-black uppercase tracking-tight md:text-4xl">
                Quiénes somos
              </h2>
              <p className="mt-6 leading-8 text-[#A3A3A3]">
                Nacimos entre aficionados que crecimos en las galleras: el grito de la gente, el
                gallo que entra al ruedo y la tensión de cada pelea. Quisimos que esa emoción llegara
                a cualquier lugar, sin perder la esencia de la tradición.
              </p>
              <p className="mt-4 leading-8 text-[#A3A3A3]">
                Hoy transmitimos en vivo desde la gallera, con imagen nítida y apuestas que se abren
                y cierran en el momento justo, para que sientas que estás en primera fila.
              </p>
            </article>
            <article className="border-l border-[#2A2A2A] md:pl-12">
              <h2 className="font-heading text-3xl font-black uppercase tracking-tight md:text-4xl">
                Lo que nos <span className="text-[#D99024]">mueve</span>
              </h2>
              <p className="mt-6 leading-8 text-[#A3A3A3]">
                Respeto por la tradición, transparencia en cada cuota y trato cercano con cada
                jugador. Aquí no eres un número: eres parte de la afición.
              </p>
              <p className="mt-4 leading-8 text-[#A3A3A3]">
                Nuestro equipo de atención responde rápido, y nuestros pagos se procesan sin vueltas
                ni letra pequeña.
              </p>
            </article>
          </div>
        </section>

        <section className="border-y border-[#2A2A2A] bg-[#111111] px-6 py-20">
          <div className="mx-auto max-w-[1280px]">
            <div className="grid overflow-hidden rounded-2xl border border-[#D99024]/40 bg-[#171717] sm:grid-cols-2 lg:grid-cols-4">
              {stats.map((stat, index) => (
                <div
                  key={stat.label}
                  className={`px-6 py-8 text-center ${index < stats.length - 1 ? 'border-b border-[#2A2A2A] sm:border-r lg:border-b-0' : ''}`}
                >
                  <strong className="block font-heading text-3xl font-black text-[#D99024]">
                    {stat.value}
                  </strong>
                  <span className="mt-2 block text-sm text-[#A3A3A3]">{stat.label}</span>
                </div>
              ))}
            </div>

            <div className="mt-8 grid gap-4 md:grid-cols-3">
              {benefits.map(benefit => (
                <article
                  key={benefit.number}
                  className="group rounded-xl border border-[#2A2A2A] bg-[#171717] p-7 transition-all hover:-translate-y-1 hover:border-[#D71920]/60"
                >
                  <span className="font-heading text-xs font-black tracking-widest text-[#D71920]">
                    {benefit.number}
                  </span>
                  <h3 className="mt-5 font-heading text-lg font-black uppercase text-[#F5F5F5]">
                    {benefit.title}
                  </h3>
                  <p className="mt-3 text-sm leading-6 text-[#A3A3A3]">{benefit.description}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-[1280px] px-6 py-20">
          <div className="flex flex-col justify-between gap-5 md:flex-row md:items-end">
            <div>
              <span className="font-heading text-[10px] font-bold tracking-[0.3em] text-[#D71920]">
                EMPIEZA HOY
              </span>
              <h2 className="mt-4 font-heading text-3xl font-black uppercase tracking-tight md:text-4xl">
                Cómo entrar al ruedo
              </h2>
            </div>
            <p className="max-w-md text-sm leading-6 text-[#A3A3A3]">
              En cuatro pasos tendrás acceso a la cartelera, la transmisión y las apuestas en vivo.
            </p>
          </div>
          <ol className="mt-10 grid gap-4 md:grid-cols-4">
            {steps.map((step, index) => (
              <li key={step.title} className="relative rounded-xl border border-[#2A2A2A] bg-[#171717] p-6">
                <span className="font-heading text-4xl font-black text-[#D71920]/30">
                  {String(index + 1).padStart(2, '0')}
                </span>
                <strong className="mt-7 block font-heading text-sm font-black uppercase tracking-wider">
                  {step.title}
                </strong>
                <span className="mt-2 block text-sm leading-6 text-[#A3A3A3]">{step.description}</span>
              </li>
            ))}
          </ol>
        </section>

        <section className="px-6 pb-20">
          <div className="mx-auto flex max-w-[1280px] flex-col gap-6 rounded-2xl border border-[#176B45]/50 bg-[#176B45]/10 p-7 md:flex-row md:items-center md:p-9">
            <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full border border-[#176B45] bg-[#176B45]/20">
              <span className="font-heading text-lg font-black text-[#4FA77C]">18+</span>
            </div>
            <div>
              <h2 className="font-heading text-xl font-black uppercase">Juega con responsabilidad</h2>
              <p className="mt-2 max-w-5xl text-sm leading-6 text-[#A3A3A3]">
                Solo para mayores de 18 años. Apuesta únicamente dinero que puedas permitirte perder,
                fija tus propios límites y no persigas pérdidas. Si el juego deja de ser diversión,
                escríbenos para activar una pausa o autoexclusión.
              </p>
            </div>
          </div>
        </section>

        <section className="relative overflow-hidden border-y border-[#D71920]/30 bg-[#D71920] px-6 py-20 text-center">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(11,11,11,0.05),rgba(11,11,11,0.45))]" />
          <div className="relative mx-auto max-w-3xl">
            <span className="font-heading text-[10px] font-bold tracking-[0.3em] text-[#F5F5F5]/70">
              LA ACCIÓN NO SE DETIENE
            </span>
            <h2 className="mt-4 font-heading text-3xl font-black uppercase leading-tight md:text-5xl">
              La próxima pelea ya está por empezar
            </h2>
            <p className="mx-auto mt-5 max-w-xl leading-7 text-[#F5F5F5]/75">
              Únete a la afición, entra al ruedo desde tu pantalla y vive cada pelea en directo.
            </p>
            <button
              onClick={onGoRegister}
              className="mt-8 rounded-lg bg-[#D99024] px-8 py-4 font-heading text-xs font-black tracking-widest text-[#0B0B0B] shadow-xl transition-all hover:-translate-y-0.5 hover:bg-[#F0A936]"
            >
              CREAR MI CUENTA AHORA
            </button>
          </div>
        </section>
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
            © 2026 GallerApp · SOLO MAYORES DE 18 AÑOS · JUEGA CON RESPONSABILIDAD
          </p>
        </div>
      </footer>
    </div>
  )
}
