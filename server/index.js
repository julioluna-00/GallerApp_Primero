import { createServer } from 'node:http'
import { randomBytes, scrypt as scryptCallback, timingSafeEqual, createHmac } from 'node:crypto'
import { promisify } from 'node:util'
import { readFile, writeFile, mkdir } from 'node:fs/promises'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const scrypt = promisify(scryptCallback)
const PORT = Number(process.env.API_PORT || 3001)
const SECRET = process.env.JWT_SECRET || 'gallerapp-demo-secret-cambiar-en-produccion'
const DB_FILE = resolve(dirname(fileURLToPath(import.meta.url)), 'data', 'users.json')
const TOKEN_TTL = 60 * 60 * 24
const EVENTS_FILE = resolve(dirname(fileURLToPath(import.meta.url)), 'data', 'events.json')
const ROOSTERS_FILE = resolve(dirname(fileURLToPath(import.meta.url)), 'data', 'roosters.json')
const FIGHTS_FILE = resolve(dirname(fileURLToPath(import.meta.url)), 'data', 'fights.json')
const BETS_FILE = resolve(dirname(fileURLToPath(import.meta.url)), 'data', 'bets.json')

const defaultEvents = [
  { id: '1', name: 'Gran Derby GallerApp', date: '2026-03-07', time: '7:30 PM', arena: 'Principal', fights: 14, status: 'live', prize: 25000000 },
  { id: '2', name: 'Copa Elite', date: '2026-03-12', time: '8:00 PM', arena: 'Principal', fights: 12, status: 'upcoming', prize: 0 },
  { id: '3', name: 'Torneo del Campeon', date: '2026-03-18', time: '7:00 PM', arena: 'Norte', fights: 16, status: 'upcoming', prize: 0 },
  { id: '4', name: 'Clasico de la Montana', date: '2026-03-22', time: '6:30 PM', arena: 'Principal', fights: 10, status: 'upcoming', prize: 0 },
  { id: '5', name: 'Derby de Campeones', date: '2026-02-28', time: '8:30 PM', arena: 'Central', fights: 15, status: 'finished', prize: 0 },
  { id: '6', name: 'Copa Apertura', date: '2026-02-20', time: '7:30 PM', arena: 'Principal', fights: 11, status: 'finished', prize: 0 },
]

const defaultRoosters = [
  { id: 'sample-1', name: 'Obsidiana', code: 'AN-458921', breed: 'Kelso', weight: '2.18 kg', age: '20 meses', arena: 'Principal', owner: 'Criadero El Roble', wins: 8, fights: 10, status: 'active', image: 'https://images.unsplash.com/photo-1695641442811-41e101d07a40?crop=entropy&cs=tinysrgb&fit=crop&fm=jpg&q=85&w=900&h=720' },
  { id: 'sample-2', name: 'Sangre Real', code: 'AN-572104', breed: 'Hatch', weight: '2.12 kg', age: '18 meses', arena: 'San Miguel', owner: 'Gallera La Corona', wins: 6, fights: 8, status: 'active', image: 'https://images.unsplash.com/photo-1695641442793-adb6fcbbd7b1?crop=entropy&cs=tinysrgb&fit=crop&fm=jpg&q=85&w=900&h=720' },
  { id: 'sample-3', name: 'Furia Dorada', code: 'AN-390847', breed: 'Sweater', weight: '2.24 kg', age: '22 meses', arena: 'Norte', owner: 'Los Hermanos', wins: 7, fights: 9, status: 'active', image: 'https://images.unsplash.com/photo-1695641442766-c8d9319df9a3?crop=entropy&cs=tinysrgb&fit=crop&fm=jpg&q=85&w=900&h=720' },
  { id: 'sample-4', name: 'Rayo Negro', code: 'AN-611305', breed: 'Radio', weight: '2.09 kg', age: '17 meses', arena: 'Principal', owner: 'Criadero El Rayo', wins: 5, fights: 6, status: 'active', image: 'https://images.unsplash.com/photo-1583991191610-3a5967914b10?crop=entropy&cs=tinysrgb&fit=crop&fm=jpg&q=85&w=900&h=720' },
  { id: 'sample-5', name: 'El Campeón', code: 'AN-284190', breed: 'Claret', weight: '2.20 kg', age: '31 meses', arena: 'Central', owner: 'Gallera La Unión', wins: 11, fights: 15, status: 'inactive', image: 'https://images.unsplash.com/photo-1602241501571-c0a8e741af2e?crop=entropy&cs=tinysrgb&fit=crop&fm=jpg&q=85&w=900&h=720' },
  { id: 'sample-6', name: 'Trueno Rojo', code: 'AN-194632', breed: 'Roundhead', weight: '2.16 kg', age: '29 meses', arena: 'San Miguel', owner: 'Criadero Santa Fe', wins: 9, fights: 13, status: 'inactive', image: 'https://images.unsplash.com/photo-1695641442793-adb6fcbbd7b1?crop=entropy&cs=tinysrgb&fit=crop&fm=jpg&q=85&w=900&h=720' },
]

async function readUsers() {
  try { return JSON.parse(await readFile(DB_FILE, 'utf8')) }
  catch (error) { if (error.code === 'ENOENT') return []; throw error }
}
function normalizeDocument(value) {
  return String(value ?? '')
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-zA-Z0-9]/g, '')
    .toUpperCase()
}
let userMutationQueue = Promise.resolve()
function withUserMutationLock(action) {
  const operation = userMutationQueue.then(action, action)
  userMutationQueue = operation.then(() => undefined, () => undefined)
  return operation
}
async function saveUsers(users) {
  const documents = new Set()
  for (const user of users) {
    const normalized = normalizeDocument(user.documento)
    if (!normalized) continue
    if (documents.has(normalized)) {
      const error = new Error('Ya existe una cuenta con este número de cédula o pasaporte.')
      error.status = 409
      throw error
    }
    documents.add(normalized)
    user.documentoNormalizado = normalized
  }
  await mkdir(dirname(DB_FILE), { recursive: true })
  await writeFile(DB_FILE, JSON.stringify(users, null, 2), 'utf8')
}
async function readEvents() {
  try { return JSON.parse(await readFile(EVENTS_FILE, 'utf8')) }
  catch (error) {
    if (error.code !== 'ENOENT') throw error
    await mkdir(dirname(EVENTS_FILE), { recursive: true })
    await writeFile(EVENTS_FILE, JSON.stringify(defaultEvents, null, 2), 'utf8')
    return defaultEvents
  }
}
async function saveEvents(events) {
  await mkdir(dirname(EVENTS_FILE), { recursive: true })
  await writeFile(EVENTS_FILE, JSON.stringify(events, null, 2), 'utf8')
}
async function readRoosters() {
  try { return JSON.parse(await readFile(ROOSTERS_FILE, 'utf8')) }
  catch (error) {
    if (error.code !== 'ENOENT') throw error
    await mkdir(dirname(ROOSTERS_FILE), { recursive: true })
    await writeFile(ROOSTERS_FILE, JSON.stringify(defaultRoosters, null, 2), 'utf8')
    return defaultRoosters
  }
}
async function saveRoosters(roosters) {
  await mkdir(dirname(ROOSTERS_FILE), { recursive: true })
  await writeFile(ROOSTERS_FILE, JSON.stringify(roosters, null, 2), 'utf8')
}
async function readFights() {
  try { return JSON.parse(await readFile(FIGHTS_FILE, 'utf8')) }
  catch (error) {
    if (error.code === 'ENOENT') return []
    throw error
  }
}
async function saveFights(fights) {
  await mkdir(dirname(FIGHTS_FILE), { recursive: true })
  await writeFile(FIGHTS_FILE, JSON.stringify(fights, null, 2), 'utf8')
}
async function readBets() {
  try { return JSON.parse(await readFile(BETS_FILE, 'utf8')) }
  catch (error) { if (error.code === 'ENOENT') return []; throw error }
}
async function saveBets(bets) {
  await mkdir(dirname(BETS_FILE), { recursive: true })
  await writeFile(BETS_FILE, JSON.stringify(bets, null, 2), 'utf8')
}
function fightView(fight, events, roosters) {
  const event = events.find(item => item.id === fight.eventId)
  const roosterA = roosters.find(item => item.id === fight.roosterAId)
  const roosterB = roosters.find(item => item.id === fight.roosterBId)
  const nameA = roosterA?.name || fight.roosterAName
  const nameB = roosterB?.name || fight.roosterBName
  return {
    ...fight,
    eventName: event?.name || fight.eventName,
    eventDate: event?.date || fight.eventDate,
    eventTime: event?.time || fight.eventTime,
    eventArena: event?.arena || fight.eventArena,
    roosterA: { id: fight.roosterAId, name: nameA, code: roosterA?.code || fight.roosterACode, image: roosterA?.image || fight.roosterAImage },
    roosterB: { id: fight.roosterBId, name: nameB, code: roosterB?.code || fight.roosterBCode, image: roosterB?.image || fight.roosterBImage },
    oddsA: Number(fight.oddsA) || 1.85,
    oddsB: Number(fight.oddsB) || 2.10,
    winnerRoosterName: fight.winnerRoosterId === fight.roosterAId ? nameA : fight.winnerRoosterId === fight.roosterBId ? nameB : null,
  }
}
function syncEventStatuses(events, fights) {
  let changed = false
  for (const event of events) {
    const eventFights = fights.filter(fight => fight.eventId === event.id)
    const nextStatus = eventFights.some(fight => fight.status === 'live')
      ? 'live'
      : eventFights.length > 0 && eventFights.every(fight => fight.status === 'finished')
        ? 'finished'
        : event.status === 'live' ? 'upcoming' : event.status
    if (event.status !== nextStatus) { event.status = nextStatus; changed = true }
  }
  return changed
}
function validRoosterInput(input) {
  const name = String(input.name || '').trim()
  const code = String(input.code || '').trim()
  const breed = String(input.breed || '').trim()
  const arena = String(input.arena || '').trim()
  const weight = Number(input.weight)
  const age = Number(input.age)
  const wins = Number(input.wins)
  const image = typeof input.image === 'string' ? input.image : ''
  const imageBytes = image.startsWith('data:image/') ? Math.floor((image.split(',')[1] || '').length * 0.75) : 0
  if (!name || !code || !breed || !arena || !Number.isFinite(weight) || weight <= 0 || !Number.isInteger(age) || age <= 0 || !Number.isInteger(wins) || wins < 0 || wins > 10000) return null
  if (image && (!/^data:image\/(png|jpeg|webp);base64,/.test(image) || imageBytes > 1_500_000)) return null
  return { name, code, breed, weight: `${weight.toFixed(2)} kg`, age: `${age} meses`, arena, wins, fights: wins, status: 'active', image: image || defaultRoosters[0].image }
}
function validateEvent(input) {
  const event = {
    name: String(input.name || '').trim(),
    date: String(input.date || ''),
    time: String(input.time || '').trim(),
    arena: String(input.arena || '').trim(),
    fights: Number(input.fights),
    status: String(input.status || ''),
    prize: Math.max(0, Number(input.prize) || 0),
  }
  if (!event.name || !/^\d{4}-\d{2}-\d{2}$/.test(event.date) || !event.time || !event.arena || !Number.isInteger(event.fights) || event.fights < 1 || !['live', 'upcoming', 'finished'].includes(event.status)) return null
  return event
}
async function adminFor(req) {
  const user = await authenticatedUser(req)
  return user?.role === 'administrador' ? user : null
}
function respond(res, status, body) {
  res.writeHead(status, { 'Content-Type': 'application/json; charset=utf-8', 'Access-Control-Allow-Origin': 'http://localhost:8443', 'Access-Control-Allow-Headers': 'Content-Type, Authorization', 'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS' })
  res.end(JSON.stringify(body))
}
async function bodyOf(req) {
  let raw = ''
  for await (const chunk of req) { raw += chunk; if (raw.length > 2_100_000) throw new Error('La solicitud es demasiado grande.') }
  return JSON.parse(raw || '{}')
}
function sign(payload) {
  const data = Buffer.from(JSON.stringify(payload)).toString('base64url')
  const signature = createHmac('sha256', SECRET).update(data).digest('base64url')
  return `${data}.${signature}`
}
function verify(token) {
  const [data, signature] = (token || '').split('.')
  if (!data || !signature) return null
  const expected = createHmac('sha256', SECRET).update(data).digest()
  let actual
  try { actual = Buffer.from(signature, 'base64url') } catch { return null }
  if (actual.length !== expected.length || !timingSafeEqual(actual, expected)) return null
  try {
    const payload = JSON.parse(Buffer.from(data, 'base64url').toString())
    return payload.exp > Date.now() / 1000 ? payload : null
  } catch { return null }
}
const publicUser = ({ passwordHash, passwordSalt, profileImage, documentoNormalizado, ...user }) => ({ role: 'usuario', ...user })

async function authenticatedUser(req) {
  const payload = verify((req.headers.authorization || '').replace(/^Bearer\s+/i, ''))
  if (!payload) return null
  return (await readUsers()).find(user => user.id === payload.sub) || null
}

const server = createServer(async (req, res) => {
  if (req.method === 'OPTIONS') return respond(res, 204, {})
  const path = new URL(req.url, `http://${req.headers.host}`).pathname
  try {
    if (req.method === 'GET' && path === '/api/health') return respond(res, 200, { ok: true, service: 'GallerApp API' })
    if (req.method === 'POST' && path === '/api/auth/register') {
      const input = await bodyOf(req)
      const email = String(input.email || '').trim().toLowerCase()
      const password = String(input.password || '')
      if (!email || !/^\S+@\S+\.\S+$/.test(email)) return respond(res, 400, { message: 'Ingresa un correo válido.' })
      if (password.length < 8) return respond(res, 400, { message: 'La contraseña debe tener al menos 8 caracteres.' })
      if (!input.acepta || !input.mayores) return respond(res, 400, { message: 'Debes aceptar los términos y confirmar que eres mayor de edad.' })
      const passwordSalt = randomBytes(16).toString('hex')
      const passwordHash = (await scrypt(password, passwordSalt, 64)).toString('hex')
      const user = { id: randomBytes(12).toString('hex'), email, role: 'usuario', nombre: String(input.nombre || '').trim(), apellido: String(input.apellido || '').trim(), telefono: String(input.telefono || '').trim(), pais: String(input.pais || 'Colombia'), fecha: String(input.fecha || ''), documento: String(input.documento || '').trim(), saldo: 50000, createdAt: new Date().toISOString(), passwordSalt, passwordHash }
      if (!user.nombre || !user.apellido || !user.telefono || !user.documento || user.documento.length > 40) return respond(res, 400, { message: 'Completa todos los datos personales y revisa el número de documento.' })
      const normalizedDocument = normalizeDocument(user.documento)
      if (!normalizedDocument) return respond(res, 400, { message: 'Ingresa un número de cédula o pasaporte válido.' })
      user.documentoNormalizado = normalizedDocument
      return await withUserMutationLock(async () => {
        const users = await readUsers()
        if (users.some(item => item.email.toLowerCase() === email)) return respond(res, 409, { message: 'Ya existe una cuenta con ese correo.' })
        if (users.some(item => (item.documentoNormalizado || normalizeDocument(item.documento)) === normalizedDocument)) return respond(res, 409, { message: 'Ya existe una cuenta con este número de cédula o pasaporte.' })
        users.push(user)
        await saveUsers(users)
        return respond(res, 201, { message: 'Cuenta creada correctamente.', user: publicUser(user) })
      })
    }
    if (req.method === 'POST' && path === '/api/auth/login') {
      const input = await bodyOf(req)
      const email = String(input.email || '').trim().toLowerCase()
      const users = await readUsers()
      const user = users.find(item => item.email === email)
      if (!user) return respond(res, 401, { message: 'Correo o contraseña incorrectos.' })
      const hash = await scrypt(String(input.password || ''), user.passwordSalt, 64)
      if (!timingSafeEqual(hash, Buffer.from(user.passwordHash, 'hex'))) return respond(res, 401, { message: 'Correo o contraseña incorrectos.' })
      const token = sign({ sub: user.id, exp: Math.floor(Date.now() / 1000) + TOKEN_TTL })
      return respond(res, 200, { message: 'Inicio de sesión correcto.', token, user: publicUser(user) })
    }
    if (req.method === 'GET' && path === '/api/auth/me') {
      const user = await authenticatedUser(req)
      return user ? respond(res, 200, { user: publicUser(user) }) : respond(res, 401, { message: 'Usuario no encontrado.' })
    }
    if (path === '/api/auth/profile' && ['GET', 'PUT'].includes(req.method)) {
      const user = await authenticatedUser(req)
      if (!user) return respond(res, 401, { message: 'Inicia sesión para consultar tu perfil.' })
      if (req.method === 'GET') return respond(res, 200, { profile: { ...publicUser(user), profileImage: user.profileImage || '' } })
      const input = await bodyOf(req)
      const email = String(input.email || '').trim().toLowerCase()
      const nombre = String(input.nombre || '').trim()
      const apellido = String(input.apellido || '').trim()
      const telefono = String(input.telefono || '').trim()
      const pais = String(input.pais || '').trim()
      const fecha = String(input.fecha || '').trim()
      const documento = String(input.documento || '').trim()
      const profileImage = typeof input.profileImage === 'string' ? input.profileImage : user.profileImage || ''
      const imageBytes = profileImage.startsWith('data:image/') ? Math.floor((profileImage.split(',')[1] || '').length * 0.75) : 0
      if (!/^\S+@\S+\.\S+$/.test(email) || !nombre || !apellido || !telefono || !pais || !documento || (fecha && !/^\d{4}-\d{2}-\d{2}$/.test(fecha))) return respond(res, 400, { message: 'Revisa el correo y completa tus datos personales.' })
      if (email.length > 254 || nombre.length > 80 || apellido.length > 80 || telefono.length > 30 || pais.length > 80 || documento.length > 40) return respond(res, 400, { message: 'Uno de los datos supera el largo permitido.' })
      if (profileImage && (!/^data:image\/jpeg;base64,/.test(profileImage) || imageBytes > 1_500_000)) return respond(res, 400, { message: 'La foto debe ser JPG y no superar 1.5 MB.' })
      const normalizedDocument = normalizeDocument(documento)
      if (!normalizedDocument) return respond(res, 400, { message: 'Ingresa un número de cédula o pasaporte válido.' })
      return await withUserMutationLock(async () => {
        const users = await readUsers()
        if (users.some(item => item.id !== user.id && item.email.toLowerCase() === email)) return respond(res, 409, { message: 'Ese correo ya está asociado a otra cuenta.' })
        if (users.some(item => item.id !== user.id && (item.documentoNormalizado || normalizeDocument(item.documento)) === normalizedDocument)) return respond(res, 409, { message: 'Ese número de cédula o pasaporte ya está asociado a otra cuenta.' })
        const storedUser = users.find(item => item.id === user.id)
        Object.assign(storedUser, { email, nombre, apellido, telefono, pais, fecha, documento, documentoNormalizado: normalizedDocument, profileImage })
        await saveUsers(users)
        return respond(res, 200, { message: 'Perfil actualizado correctamente.', profile: { ...publicUser(storedUser), profileImage: storedUser.profileImage || '' } })
      })
    }
    if (req.method === 'GET' && path === '/api/roosters') return respond(res, 200, { roosters: await readRoosters() })
    if (req.method === 'POST' && path === '/api/roosters') {
      const input = await bodyOf(req)
      const values = validRoosterInput(input)
      if (!values) return respond(res, 400, { message: 'Revisa los datos del gallo y usa una foto JPG, PNG o WEBP de máximo 1.5 MB.' })
      const roosters = await readRoosters()
      if (roosters.some(rooster => rooster.code.toLowerCase() === String(input.code).trim().toLowerCase())) return respond(res, 409, { message: 'Ya existe un gallo con ese número de anillo o placa.' })
      const user = await authenticatedUser(req)
      const created = { id: randomBytes(12).toString('hex'), ...values, owner: user ? `${user.nombre} ${user.apellido}`.trim() : 'Participante', createdAt: new Date().toISOString() }
      roosters.unshift(created)
      await saveRoosters(roosters)
      return respond(res, 201, { message: 'Gallo inscrito correctamente.', rooster: created })
    }
    const roosterRoute = path.match(/^\/api\/admin\/roosters\/([^/]+)(?:\/(wins))?$/)
    if (roosterRoute && ['POST', 'PUT', 'DELETE'].includes(req.method)) {
      if (!await adminFor(req)) return respond(res, 403, { message: 'Solo un administrador puede modificar los gallos.' })
      const roosters = await readRoosters()
      const index = roosters.findIndex(rooster => rooster.id === roosterRoute[1])
      if (index < 0) return respond(res, 404, { message: 'Gallo no encontrado.' })
      if (req.method === 'DELETE' && !roosterRoute[2]) {
        const fights = await readFights()
        if (fights.some(fight => (fight.roosterAId === roosters[index].id || fight.roosterBId === roosters[index].id) && fight.status !== 'finished')) return respond(res, 409, { message: 'No puedes eliminar un gallo que tiene peleas pendientes o en vivo.' })
        roosters.splice(index, 1)
        await saveRoosters(roosters)
        return respond(res, 200, { message: 'Gallo eliminado correctamente.' })
      }
      if (req.method === 'POST' && roosterRoute[2] === 'wins') {
        if (roosters[index].status !== 'active') return respond(res, 409, { message: 'Un gallo inactivo no puede sumar victorias.' })
        roosters[index].wins += 1
        roosters[index].fights += 1
        await saveRoosters(roosters)
        return respond(res, 200, { rooster: roosters[index] })
      }
      if (req.method === 'PUT' && !roosterRoute[2]) {
        const input = await bodyOf(req)
        if (!['active', 'inactive'].includes(input.status)) return respond(res, 400, { message: 'El estado debe ser activo o inactivo.' })
        if (roosters[index].status === 'inactive' && input.status === 'active') return respond(res, 409, { message: 'Un gallo inactivo no se puede reactivar.' })
        if (input.status === 'inactive') {
          const fights = await readFights()
          if (fights.some(fight => (fight.roosterAId === roosters[index].id || fight.roosterBId === roosters[index].id) && fight.status !== 'finished')) return respond(res, 409, { message: 'Finaliza o cancela las peleas pendientes antes de dar de baja este gallo.' })
        }
        roosters[index].status = input.status
        await saveRoosters(roosters)
        return respond(res, 200, { rooster: roosters[index] })
      }
    }
    if (req.method === 'GET' && path === '/api/fights') {
      const [fights, events, roosters] = await Promise.all([readFights(), readEvents(), readRoosters()])
      return respond(res, 200, { fights: fights.map(fight => fightView(fight, events, roosters)) })
    }
    if (req.method === 'GET' && path === '/api/bets/me') {
      const user = await authenticatedUser(req)
      if (!user) return respond(res, 401, { message: 'Inicia sesión para consultar tus apuestas.' })
      const bets = await readBets()
      return respond(res, 200, { bets: bets.filter(bet => bet.userId === user.id).map(({ userId, ...bet }) => bet) })
    }
    if (req.method === 'POST' && path === '/api/bets') {
      const user = await authenticatedUser(req)
      if (!user || user.role !== 'usuario') return respond(res, 403, { message: 'Inicia sesión con una cuenta de usuario para apostar.' })
      const input = await bodyOf(req)
      const amount = Number(input.amount)
      if (!Number.isSafeInteger(amount) || amount < 1000) return respond(res, 400, { message: 'La apuesta mínima es de $1.000.' })
      const [fights, bets, users] = await Promise.all([readFights(), readBets(), readUsers()])
      const fight = fights.find(item => item.id === String(input.fightId || ''))
      if (!fight || !['upcoming', 'live'].includes(fight.status)) return respond(res, 409, { message: 'Esta pelea ya no acepta apuestas.' })
      if (![fight.roosterAId, fight.roosterBId].includes(String(input.roosterId || ''))) return respond(res, 400, { message: 'Selecciona uno de los dos gallos de esta pelea.' })
      if (bets.some(bet => bet.userId === user.id && bet.fightId === fight.id)) return respond(res, 409, { message: 'Ya tienes una apuesta registrada para esta pelea.' })
      const storedUser = users.find(item => item.id === user.id)
      if (!storedUser || amount > (storedUser.saldo || 0)) return respond(res, 409, { message: 'No tienes saldo suficiente para esa apuesta.' })
      const roosterName = input.roosterId === fight.roosterAId ? fight.roosterAName : fight.roosterBName
      const multiplier = String(input.roosterId) === fight.roosterAId ? Number(fight.oddsA) || 1.85 : Number(fight.oddsB) || 2.10
      const potentialPayout = Math.round(amount * multiplier)
      const bet = { id: randomBytes(12).toString('hex'), userId: user.id, fightId: fight.id, fightNumber: fight.number, eventName: fight.eventName, roosterId: String(input.roosterId), roosterName, amount, multiplier, potentialPayout, status: 'pending', createdAt: new Date().toISOString() }
      storedUser.saldo -= amount
      bets.push(bet)
      await Promise.all([saveUsers(users), saveBets(bets)])
      const { userId, ...publicBet } = bet
      return respond(res, 201, { bet: publicBet, user: publicUser(storedUser) })
    }
    if (req.method === 'GET' && path === '/api/events') {
      const [events, fights] = await Promise.all([readEvents(), readFights()])
      if (syncEventStatuses(events, fights)) await saveEvents(events)
      return respond(res, 200, { events })
    }
    if (path === '/api/admin/events' && req.method === 'POST') {
      if (!await adminFor(req)) return respond(res, 403, { message: 'Solo un administrador puede modificar los eventos.' })
      const event = validateEvent(await bodyOf(req))
      if (!event) return respond(res, 400, { message: 'Revisa el nombre, fecha, hora, lugar, numero de peleas y estado.' })
      const events = await readEvents()
      const created = { id: randomBytes(12).toString('hex'), ...event }
      events.push(created)
      await saveEvents(events)
      return respond(res, 201, { event: created })
    }
    const eventRoute = path.match(/^\/api\/admin\/events\/([^/]+)$/)
    if (eventRoute && ['PUT', 'DELETE'].includes(req.method)) {
      if (!await adminFor(req)) return respond(res, 403, { message: 'Solo un administrador puede modificar los eventos.' })
      const events = await readEvents()
      const index = events.findIndex(event => event.id === eventRoute[1])
      if (index < 0) return respond(res, 404, { message: 'Evento no encontrado.' })
      if (req.method === 'DELETE') {
        const fights = await readFights()
        if (fights.some(fight => fight.eventId === eventRoute[1] && fight.status === 'live')) return respond(res, 409, { message: 'Finaliza la pelea en vivo antes de eliminar el evento.' })
        events.splice(index, 1)
        await saveEvents(events)
        await saveFights(fights.filter(fight => fight.eventId !== eventRoute[1]))
        return respond(res, 200, { message: 'Evento y sus peleas eliminados correctamente.' })
      }
      const updated = validateEvent(await bodyOf(req))
      if (!updated) return respond(res, 400, { message: 'Revisa el nombre, fecha, hora, lugar, numero de peleas y estado.' })
      if (updated.status === 'finished') {
        const fights = await readFights()
        if (fights.some(fight => fight.eventId === eventRoute[1] && fight.status !== 'finished')) return respond(res, 409, { message: 'Cancela o finaliza las peleas pendientes antes de finalizar el evento.' })
      }
      events[index] = { id: events[index].id, ...updated }
      await saveEvents(events)
      return respond(res, 200, { event: events[index] })
    }
    if (req.method === 'POST' && path === '/api/admin/fights') {
      if (!await adminFor(req)) return respond(res, 403, { message: 'Solo un administrador puede programar peleas.' })
      const input = await bodyOf(req)
      const [events, roosters, fights] = await Promise.all([readEvents(), readRoosters(), readFights()])
      const event = events.find(item => item.id === String(input.eventId || ''))
      const roosterA = roosters.find(item => item.id === String(input.roosterAId || ''))
      const roosterB = roosters.find(item => item.id === String(input.roosterBId || ''))
      if (!event || event.status === 'finished') return respond(res, 400, { message: 'Selecciona un evento vigente.' })
      if (!roosterA || !roosterB || roosterA.id === roosterB.id) return respond(res, 400, { message: 'Selecciona dos gallos diferentes.' })
      if (roosterA.status !== 'active' || roosterB.status !== 'active') return respond(res, 400, { message: 'Solo se pueden programar gallos activos.' })
      const eventFights = fights.filter(fight => fight.eventId === event.id)
      if (eventFights.length >= event.fights) return respond(res, 409, { message: 'El evento ya tiene todas las peleas programadas.' })
      if (fights.some(fight => fight.status !== 'finished' && (fight.roosterAId === roosterA.id || fight.roosterBId === roosterA.id || fight.roosterAId === roosterB.id || fight.roosterBId === roosterB.id))) return respond(res, 409, { message: 'Uno de estos gallos ya está en una pelea pendiente o en vivo.' })
      const oddsA = Number(input.oddsA ?? 1.85)
      const oddsB = Number(input.oddsB ?? 2.10)
      if (!Number.isFinite(oddsA) || !Number.isFinite(oddsB) || oddsA < 1.01 || oddsB < 1.01 || oddsA > 100 || oddsB > 100 || Math.round(oddsA * 100) !== oddsA * 100 || Math.round(oddsB * 100) !== oddsB * 100) return respond(res, 400, { message: 'Las cuotas deben estar entre 1,01 y 100,00 con máximo dos decimales.' })
      const created = {
        id: randomBytes(12).toString('hex'), number: Math.max(0, ...eventFights.map(fight => fight.number)) + 1, eventId: event.id,
        eventName: event.name, eventDate: event.date, eventTime: event.time, eventArena: event.arena,
        roosterAId: roosterA.id, roosterAName: roosterA.name, roosterACode: roosterA.code, roosterAImage: roosterA.image,
        roosterBId: roosterB.id, roosterBName: roosterB.name, roosterBCode: roosterB.code, roosterBImage: roosterB.image,
        oddsA, oddsB,
        status: 'upcoming', winnerRoosterId: null, createdAt: new Date().toISOString(), finishedAt: null,
      }
      fights.push(created)
      await saveFights(fights)
      return respond(res, 201, { fight: fightView(created, events, roosters) })
    }
    const fightRoute = path.match(/^\/api\/admin\/fights\/([^/]+)(?:\/(start|finish|odds))?$/)
    if (fightRoute && ['PUT', 'DELETE'].includes(req.method)) {
      if (!await adminFor(req)) return respond(res, 403, { message: 'Solo un administrador puede administrar las peleas.' })
      const fights = await readFights()
      const index = fights.findIndex(fight => fight.id === fightRoute[1])
      if (index < 0) return respond(res, 404, { message: 'Pelea no encontrada.' })
      const fight = fights[index]
      if (req.method === 'PUT' && fightRoute[2] === 'odds') {
        if (fight.status !== 'upcoming') return respond(res, 409, { message: 'Las cuotas solo se pueden modificar antes de iniciar la pelea.' })
        const input = await bodyOf(req)
        const oddsA = Number(input.oddsA)
        const oddsB = Number(input.oddsB)
        if (!Number.isFinite(oddsA) || !Number.isFinite(oddsB) || oddsA < 1.01 || oddsB < 1.01 || oddsA > 100 || oddsB > 100 || Math.round(oddsA * 100) !== oddsA * 100 || Math.round(oddsB * 100) !== oddsB * 100) return respond(res, 400, { message: 'Las cuotas deben estar entre 1,01 y 100,00 con máximo dos decimales.' })
        fight.oddsA = oddsA
        fight.oddsB = oddsB
        await saveFights(fights)
        return respond(res, 200, { fight: fightView(fight, await readEvents(), await readRoosters()) })
      }
      if (req.method === 'DELETE' && !fightRoute[2]) {
        if (fight.status !== 'upcoming') return respond(res, 409, { message: 'Solo se pueden cancelar peleas que aún no han comenzado.' })
        fights.splice(index, 1)
        await saveFights(fights)
        return respond(res, 200, { message: 'Pelea cancelada.' })
      }
      if (req.method === 'PUT' && fightRoute[2] === 'start') {
        if (fight.status !== 'upcoming') return respond(res, 409, { message: 'La pelea ya comenzó o ya finalizó.' })
        if (fights.some(item => item.status === 'live')) return respond(res, 409, { message: 'Finaliza la pelea que está en vivo antes de iniciar otra.' })
        const events = await readEvents()
        const event = events.find(item => item.id === fight.eventId)
        if (!event || event.status === 'finished') return respond(res, 409, { message: 'No puedes iniciar una pelea de un evento finalizado.' })
        fight.status = 'live'
        fight.startedAt = new Date().toISOString()
        if (event.status !== 'live') { event.status = 'live'; await saveEvents(events) }
        await saveFights(fights)
        return respond(res, 200, { fight: fightView(fight, events, await readRoosters()) })
      }
      if (req.method === 'PUT' && fightRoute[2] === 'finish') {
        if (fight.status !== 'live') return respond(res, 409, { message: 'Solo puedes finalizar una pelea que esté en vivo.' })
        const input = await bodyOf(req)
        if (![fight.roosterAId, fight.roosterBId].includes(String(input.winnerRoosterId || ''))) return respond(res, 400, { message: 'El ganador debe ser uno de los dos gallos de la pelea.' })
        const roosters = await readRoosters()
        const winner = roosters.find(rooster => rooster.id === input.winnerRoosterId)
        const opponent = roosters.find(rooster => rooster.id === (input.winnerRoosterId === fight.roosterAId ? fight.roosterBId : fight.roosterAId))
        if (!winner || !opponent) return respond(res, 409, { message: 'No se encuentran los dos gallos para guardar el resultado.' })
        fight.status = 'finished'
        fight.winnerRoosterId = winner.id
        fight.finishedAt = new Date().toISOString()
        winner.wins += 1
        winner.fights += 1
        opponent.fights += 1
        opponent.status = 'inactive'
        const [bets, users] = await Promise.all([readBets(), readUsers()])
        const changedBets = bets.filter(bet => bet.fightId === fight.id && bet.status === 'pending')
        for (const bet of changedBets) {
          bet.status = bet.roosterId === winner.id ? 'won' : 'lost'
          if (bet.status === 'won') {
            const bettor = users.find(item => item.id === bet.userId)
            if (bettor) bettor.saldo = (bettor.saldo || 0) + bet.potentialPayout
            bet.paidOut = bet.potentialPayout
          } else bet.paidOut = 0
          bet.settledAt = new Date().toISOString()
        }
        const events = await readEvents()
        syncEventStatuses(events, fights)
        await Promise.all([saveFights(fights), saveRoosters(roosters), saveEvents(events), saveBets(bets), saveUsers(users)])
        return respond(res, 200, { fight: fightView(fight, events, roosters) })
      }
    }
    if (req.method === 'GET' && path === '/api/admin/summary') {
      const user = await authenticatedUser(req)
      if (!user) return respond(res, 401, { message: 'Inicia sesión para continuar.' })
      if (user.role !== 'administrador') return respond(res, 403, { message: 'Esta sección es solo para administradores.' })
      const users = await readUsers()
      return respond(res, 200, { message: 'Acceso administrativo autorizado.', role: user.role, totalUsuarios: users.filter(item => item.role !== 'administrador').length, totalAdministradores: users.filter(item => item.role === 'administrador').length })
    }
    return respond(res, 404, { message: 'Ruta no encontrada.' })
  } catch (error) {
    const status = error.status || (error instanceof SyntaxError ? 400 : 500)
    return respond(res, status, { message: error.status === 409 ? error.message : status === 400 ? 'El cuerpo JSON no es válido.' : 'Error interno del servidor.' })
  }
})

server.listen(PORT, () => console.log(`GallerApp API disponible en http://localhost:${PORT}`))
