const API_URL = import.meta.env.VITE_API_URL || ''

export interface GallerUser {
  id: string
  email: string
  nombre: string
  apellido: string
  telefono: string
  pais: string
  fecha?: string
  documento?: string
  profileImage?: string
  role: 'administrador' | 'usuario'
  saldo?: number
}

export async function apiRequest<T>(path: string, body?: unknown, method?: 'GET' | 'POST' | 'PUT' | 'DELETE'): Promise<T> {
  const token = sessionStorage.getItem('gallerapp_token')
  const response = await fetch(`${API_URL}/api${path}`, {
    method: method || (body === undefined ? 'GET' : 'POST'),
    headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) },
    ...(body === undefined ? {} : { body: JSON.stringify(body) }),
  })
  const responseText = await response.text()
  let data: { message?: string }

  try {
    data = responseText ? JSON.parse(responseText) as { message?: string } : {}
  } catch {
    throw new Error(`El servidor respondió con un formato inválido (HTTP ${response.status}).`)
  }

  if (!responseText) {
    throw new Error(response.ok
      ? 'El servidor respondió vacío. Verifica que el backend esté actualizado.'
      : `El backend no respondió correctamente (HTTP ${response.status}).`)
  }

  if (!response.ok) throw new Error(data.message || 'No fue posible completar la solicitud.')
  return data as T
}
