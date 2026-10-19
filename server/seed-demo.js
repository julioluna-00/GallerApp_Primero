import { randomBytes, scrypt as scryptCallback } from 'node:crypto'
import { promisify } from 'node:util'
import { readFile, writeFile, mkdir } from 'node:fs/promises'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const scrypt = promisify(scryptCallback)
const dbFile = resolve(dirname(fileURLToPath(import.meta.url)), 'data', 'users.json')
await mkdir(dirname(dbFile), { recursive: true })
let users = []
try { users = JSON.parse(await readFile(dbFile, 'utf8')) } catch (error) { if (error.code !== 'ENOENT') throw error }

async function ensureAccount({ email, password, role, nombre, documento }) {
  const existing = users.find(user => user.email === email)
  if (existing) {
    existing.role = role
    console.log(`Cuenta ${role} disponible: ${email}`)
    return
  }
  const passwordSalt = randomBytes(16).toString('hex')
  const passwordHash = (await scrypt(password, passwordSalt, 64)).toString('hex')
  users.push({ id: randomBytes(12).toString('hex'), email, role, nombre, apellido: 'Demo', telefono: '3000000000', pais: 'Colombia', fecha: '1995-01-01', documento, createdAt: new Date().toISOString(), passwordSalt, passwordHash })
  console.log(`Cuenta ${role} creada: ${email} / ${password}`)
}

await ensureAccount({ email: 'demo@gallerapp.com', password: 'GallerApp2026!', role: 'usuario', nombre: 'Usuario', documento: 'DEMO-001' })
await ensureAccount({ email: 'admin@gallerapp.com', password: 'AdminGaller2026!', role: 'administrador', nombre: 'Admin', documento: 'DEMO-ADMIN' })
await writeFile(dbFile, JSON.stringify(users, null, 2), 'utf8')
