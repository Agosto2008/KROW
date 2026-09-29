KROW — Tu primer trabajo no debería ser una lotería
 
Plataforma de búsqueda de empleo para jóvenes (prácticas, pasantías y preprácticas)
que conecta candidatos con empresas verificadas. SPA Angular 22 + backend
Express + MySQL 8.
 
 
---
 
Roles
 
| Rol | Qué hace | Tras iniciar sesión va a |
| ---| ---| ---|
| USUARIO | Candidato: explora ofertas, postula, guarda favoritos, entrevistas y chats | `/usuario/perfil` |
| EMPRESA | Publica y gestiona ofertas, revisa postulaciones, pide verificación | `/empresa/panel` |
| ADMIN | Modera: cola de verificaciones, reportes, empresas y cuentas | `/admin/panel` |
 
Las rutas de cada rol están protegidas por `authGuard` + `roleGuard`; sin sesión
redirigen a `/login?returnUrl=…`.
 
Credenciales de prueba (datos del seed)
 
| Rol | Correo | Contraseña |
| ---| ---| ---|
| ADMIN | `admin@krow.com` | `AdminKrow!2026` |
| USUARIO | `ana@correo.com` (también `luis@correo.com`, `carla@correo.com`) | `Krow!2026` |
| EMPRESA | `contacto@techlab.com` (TechLab, sin verificar) | `EmpresaKrow!2026` |
| EMPRESA | `hola@greenbyte.com` (GreenByte, verificada) | `EmpresaKrow!2026` |
| EMPRESA | `talento@nova.com` (NovaMedia) | `EmpresaKrow!2026` |
 
---
 
Requisitos
 
- Node.js ≥ 20 y pnpm ≥ 10 (`corepack enable`)
- MySQL 8 corriendo en `localhost:3306`
 
Estructura
 
```
KROW/                  ← raíz del repositorio (este README)
└── KROW/
    ├── backend/       ← Express + TypeScript + MySQL  (http://localhost:3000)
    └── frontend/      ← Angular 22 SPA + CSS con tokens (http://localhost:4200)
```
 
El frontend usa proxy: todo `/api` se reenvía al backend en `:3000`
(`frontend/proxy.conf.json`), así que no hay CORS en desarrollo.
 
---
 
Puesta en marcha
 
1. Base de datos + seed
 
Con MySQL corriendo, desde `KROW/backend` (usa la `DATABASE_URL` del `.env`;
no hace falta la CLI de MySQL):
 
```bash
cd KROW/backend
pnpm db:setup     # crea la BD + tablas (DB_KROW.sql) + datos demo (SEED)
 
pnpm db:seed      # solo restaura los datos demo (re-ejecutable)
```

2. Backend (puerto 3000)
 
```bash
cd KROW/backend
pnpm install
pnpm dev                  # tsx watch → http://localhost:3000
```

Variables de `backend/.env`:
 
| Variable | Ejemplo | Descripción |
| ---| ---| ---|
| `DATABASE_URL` | `mysql://root:tu_password@localhost:3306/krow_db_in5bm` | Conexión a MySQL |
| `PORT` | `3000` | Puerto de Express |
| `CORS_ORIGIN` | `http://localhost:4200` | Origen permitido |
| `JWT_SECRET` | (clave larga y aleatoria) | Firma de los JWT |
| `JWT_EXPIRES_IN` | `1h` | Duración del token |
 
3. Frontend (puerto 4200)
 
```bash
cd KROW/frontend
pnpm install
pnpm start                # ng serve → http://localhost:4200
```
 
Abre <http://localhost:4200> y entra con cualquier credencial de la tabla.
 
---
 
Verificación (los 5 comprobadores del proyecto)
 
```bash
cd KROW/frontend
pnpm exec tsc --noEmit -p tsconfig.app.json   # tipos de la app
pnpm exec tsc --noEmit -p tsconfig.spec.json  # tipos de los tests
pnpm run build                                # compila templates (ng build)
pnpm test                                     # vitest: 19 tests de humo
 
cd KROW/backend
pnpm exec tsc --noEmit -p tsconfig.json       # tipos del backend
```
 
`ng test` usa vitest + jsdom (`@angular/build:unit-test`): render de la app,
`AuthService` (incluida la regresión `id_usuario ≠ id_cuenta`), `authGuard` y
`roleGuard`.
 

