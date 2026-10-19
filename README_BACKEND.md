# GallerApp: adelanto de backend

Este adelanto conecta el frontend de React con una API en Node.js para registro e inicio de sesión. El servidor usa módulos nativos de Node, por lo que no requiere instalar dependencias adicionales para el backend.

## Requisitos

- Node.js 20 o superior
- npm

## Ejecutar en desarrollo

En una terminal, desde la carpeta del proyecto:

```bash
npm install
npm run seed:demo
npm run server
```

En una segunda terminal:

```bash
npm run dev
```

Abre la URL que muestra Vite (normalmente `http://localhost:8443`). El proxy de Vite envía las rutas `/api` al backend en `http://localhost:3001`.

## Cuenta de demostración

- Correo: `demo@gallerapp.com`
- Contraseña: `GallerApp2026!`
- Rol: usuario normal

Cuenta con permisos de administrador:

- Correo: `admin@gallerapp.com`
- Contraseña: `AdminGaller2026!`
- Rol: administrador

También puedes crear una cuenta desde el formulario de registro; las cuentas nuevas siempre reciben el rol `usuario`. El rol no se acepta desde el formulario. Los usuarios se guardan en `server/data/users.json`; las contraseñas se almacenan como hashes scrypt con sal, nunca en texto plano. Los eventos se guardan en `server/data/events.json`. El panel de administración permite agregarlos, editarlos y eliminarlos; la cartelera pública y el calendario consultan la misma lista. Los gallos se guardan en `server/data/roosters.json`; las inscripciones aparecen en el directorio público y el administrador puede sumar victorias, cambiar el estado o eliminarlos.

## Rutas incluidas

| Método | Ruta | Uso |
|---|---|---|
| GET | `/api/health` | Estado del servidor |
| POST | `/api/auth/register` | Crear una cuenta y validar datos y aceptaciones |
| POST | `/api/auth/login` | Validar credenciales y emitir token firmado |
| GET | `/api/auth/me` | Consultar el usuario autenticado con token Bearer |
| GET | `/api/admin/summary` | Resumen de administración; exige una sesión de administrador |
| GET | `/api/events` | Listar eventos públicos de cartelera y calendario |
| POST | `/api/admin/events` | Agregar evento; exige administrador |
| PUT | `/api/admin/events/:id` | Editar evento; exige administrador |
| DELETE | `/api/admin/events/:id` | Quitar evento; exige administrador |
| GET | `/api/roosters` | Listar gallos para el directorio |
| POST | `/api/roosters` | Inscribir un gallo; acepta foto JPG, PNG o WEBP de hasta 1.5 MB |
| POST | `/api/admin/roosters/:id/wins` | Sumar una victoria; también incrementa el total de peleas |
| PUT | `/api/admin/roosters/:id` | Cambiar estado entre activo e inactivo |
| DELETE | `/api/admin/roosters/:id` | Eliminar gallo; exige administrador |

El frontend solo muestra el acceso al panel a los administradores, y el backend vuelve a comprobar el rol antes de entregar datos administrativos. El script `npm run seed:demo` crea las dos cuentas de muestra o restablece sus roles para la demo; no cambia la contraseña de cuentas que ya existan.

## Alcance del adelanto

La persistencia en JSON y el token firmado son adecuados para una demostración local. Para publicar el sistema se recomienda migrar a una base de datos, guardar secretos en variables de entorno, añadir HTTPS, límites de intentos y recuperación de contraseña. El inicio social y el botón de contraseña olvidada del diseño todavía son elementos visuales.
