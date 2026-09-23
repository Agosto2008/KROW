# PLAN DE REHACER KROW

> Documento de trabajo. **Nada se toca hasta aprobar este plan.**
> Objetivo: app de búsqueda de empleo para jóvenes (prácticas/pasantías/preprácticas),
> con roles USUARIO / EMPRESA / ADMIN, empresas verificadas, frontend rehecho desde cero
> sobre un backend que se endurece primero.

---

## Contexto (estado actual)

- **Frontend**: Angular 22 + SSR, 21 páginas en `frontend/src/app/pages/`, design system propio en `frontend/src/app/shader/`, 14 servicios HTTP. Tiene bugs críticos (navbar rota, botón "Cancelar" que guarda, enlaces muertos), 20 stubs muertos en `components/`, asume `id_cuenta == id_usuario` en 7 pantallas, N+1 requests por todos lados, SSR en modo `Prerender` para páginas dinámicas.
- **Backend**: Express 5 + MySQL, arquitectura por capas (routes → services → repositories), 43 endpoints, JWT + bcrypt, esquema de 13 tablas completo. Problemas: `PUT` con columnas sin whitelist (vulnerabilidad de escalada), sin validación de entrada, sin seed de admin, sin JOINs (todo el trabajo pesado lo hace el front), faltan endpoints agregados.
- **Decisión**: frontend **desde cero** (conservando backend y modelos), backend por **seguridad + endpoints que el nuevo frontend necesitará**.

---

## Estado de ejecución

- [x] **Fase 0 — Cimientos** (completada y verificada)
- [x] **Fase 1 — Seguridad backend** (completada y verificada con pruebas reales)
- [x] **Fase 2 — Endpoints agregados** (completada y verificada, incluye migración Notificacion)
- [x] **Fase 3 — Frontend desde cero: cimientos** (completada y verificada: `tsc`=0, `ng build`=0, rutas en vivo 200, API agregada OK)
- [x] **Fase 4 — Vistas públicas** (completada y verificada: `tsc`=0, `ng build`=0, backend `tsc`=0, rutas y API en vivo OK)
- [x] **Fase 5 — Vistas usuario** (completada y verificada: `tsc`=0, `ng build`=0, backend `tsc`=0, flujos en vivo OK, seed restaurado)
- [x] **Fase 6 — Vistas empresa** (completada y verificada: `tsc`=0, `ng build`=0, backend `tsc`=0, 37/37 pruebas en vivo, seed restaurado)
- [x] **Fase 7 — Vistas admin** (completada y verificada: `tsc`=0, `ng build`=0, backend `tsc`=0, 41/41 pruebas en vivo, seed restaurado)
- [ ] Fase 8 — Pulido y cierre

### Verificación de Fase 0/1 (pruebas contra la API real)
1. Login de los 3 roles con el seed → OK; password mala → 401 con mensaje generico.
2. `PUT /empresas/:id {"verificada":true}` → la whitelist lo ignora (empresa sigue sin verificar).
3. `PUT /propuestas/:id {"empresa_id":999}` → ignorado (empresa_id inmutable).
4. CV de un candidato sin relacion laboral → 403; con solicitud a la empresa → 200.
5. `GET /usuarios/:id` de otro usuario → sin telefono/direccion/fecha_nacimiento.
6. Registro con password < 8 → 400; estado de cuenta inventado → 400 (enum).
7. Postular a propuesta CERRADA → 409.
8. 11 logins fallidos → 429 (rate limit).
9. Seed aplicado (7 cuentas / 3 empresas / 7 propuestas / 6 solicitudes), proxy `/api` del frontend → backend OK.

---

## FASE 0 — Cimientos y entorno
*Sin esto, nada de lo demás se puede verificar.*

| # | Tarea | Archivos |
|---|---|---|
| 0.1 | Verificar que backend + MySQL + frontend levantan; anotar lo que falle | `backend/.env`, `frontend/` |
| 0.2 | Crear `backend/.env.example` con los nombres de variables (`PORT`, `CORS_ORIGIN`, `DATABASE_URL`, `JWT_SECRET`, `JWT_EXPIRES_IN`) | nuevo `backend/.env.example` |
| 0.3 | **Seed**: crear `backend/src/database/SEED_KROW.sql` (sin `DROP DATABASE`) con: cuenta ADMIN, 2 empresas (una verificada), 4 usuarios, propuestas de los 4 tipos, solicitudes, mensajes y una verificación pendiente → poder probar los 3 roles | nuevo `backend/src/database/SEED_KROW.sql` |
| 0.4 | Validación temprana de variables de entorno (fallar al arrancar si falta `JWT_SECRET`/`DATABASE_URL`) | nuevo `backend/src/config/env.ts`, `server.ts` |
| 0.5 | Frontend: `environment.ts` (prod) no puede apuntar a `localhost` → usar `apiUrl` relativa `/api` y proxy en dev | `frontend/src/environments/*`, `angular.json`, nuevo `proxy.conf.json` |
| 0.6 | `index.html`: `lang="es"`, título "KROW" | `frontend/src/index.html` |

---

## FASE 1 — Seguridad del backend (bloqueante) ✅ COMPLETADA

| # | Tarea | Archivos |
|---|---|---|
| 1.1 | **Whitelist de columnas en todos los updates dinámicos** ✅ helper `actualizarDinamico` + whitelist en Empresa/Usuario/Propuesta/Entrevista/Curriculum; `marcarVerificada()` exclusivo para el flujo de aprobación del admin | nuevo `utils/actualizarDinamico.ts` + 5 repositories + `VerificacionEmpresaService.ts` |
| 1.2 | **Validación de body** ✅ helpers (`texto`, `entero`, `decimal`, `enumDe`, `correo`, `password`) + validación en Auth/Solicitud/Entrevista/Propuesta/Reporte/Cuenta/Usuario/Empresa/Curriculum → 400 en vez de 500 | nuevo `middlewares/Validar.ts` + services |
| 1.3 | `POST /solicitudes`: valida que la propuesta exista y esté `ACTIVA` ✅ (409 si cerrada) | `SolicitudService.ts` |
| 1.4 | `DELETE /usuarios/:id`: borra también la `Cuenta` en cascada ✅ | `UsuarioService.ts` |
| 1.5 | `GET /usuarios/:id`: dueño/ADMIN ven todo, el resto solo campos públicos ✅. `GET /curriculums`: dueño/ADMIN o empresa con solicitud hacia ese candidato ✅ (nuevo `existeSolicitudDeEmpresa`) | `UsuarioRoutes.ts`, `CurriculumRoutes.ts`, `SolicitudRepository.ts` |
| 1.6 | `POST /favoritos/toggle`: exige rol USUARIO ✅ | `FavoritoRoutes.ts` |
| 1.7 | `POST /mensajes`: solo USUARIO/EMPRESA (el ADMIN ya no escribe como `EMPRESA`) ✅ | `MensajeRoutes.ts` |
| 1.8 | `EntrevistaRoutes`: ADMIN habilitado en los 3 handlers ✅ | `EntrevistaRoutes.ts` |
| 1.9 | `PATCH /solicitudes/:id/estado`: no pisa `comentario_empresa` con NULL ✅ | `SolicitudRepository.ts` |
| 1.10 | Verificaciones: no duplica PENDIENTE, no resuelve dos veces, enum validado ✅ | `VerificacionEmpresaService.ts` |
| 1.11 | Login: mensaje genérico (sin enumerar cuentas) + rate limit 10/15min ✅ | `AuthService.ts`, nuevo `middlewares/RateLimit.ts` |
| 1.12 | `helmet` + CORS multi-origen (coma) ✅ | `app.ts` |

---

## FASE 2 — Endpoints que el nuevo frontend necesita ✅ COMPLETADA
*Hoy el front hace N+1 peticiones y joins en cliente. El backend debe entregar listas listas para pintar.*

| # | Endpoint nuevo | Estado |
|---|---|---|
| 2.1 | `GET /propuestas/:id` → ahora devuelve **propuesta + ficha de empresa embebida** (1 query) | ✅ |
| 2.2 | `GET /favoritos/usuario/:id` → favoritos **con propuesta y empresa resueltas** | ✅ |
| 2.3 | `GET /solicitudes/usuario/:id` → solicitudes **con nombre de propuesta + empresa** | ✅ |
| 2.4 | `GET /solicitudes/empresa/:empresaId` → todas las solicitudes de la empresa **con candidato** | ✅ nuevo |
| 2.5 | `GET /entrevistas/usuario/:usuarioId` → **vista nueva**: mis entrevistas | ✅ nuevo |
| 2.6 | `GET /entrevistas/empresa/:empresaId` → entrevistas con candidato | ✅ nuevo |
| 2.7 | `GET /verificaciones-empresa?estado=` → cola global del admin (1 query) | ✅ nuevo |
| 2.8 | `GET /empresas?buscar=&pagina=` y `GET /empresas/:id/con-propuestas` | ✅ nuevo |
| 2.9 | `GET /propuestas?buscar=&pagina=` → paginación real en el servidor | ✅ |
| 2.10 | `GET /cuentas?buscar=&rol=&estado=&pagina=` → listado real del admin | ✅ nuevo |
| 2.11 | `GET /conversaciones` → sidebar de chats (otra parte, propuesta, último mensaje, no leídos) en 1 query | ✅ nuevo |
| 2.12 | `GET /usuarios/:id/publico` → perfil público del candidato con CV resumido | ✅ nuevo |
| 2.13 | Notificaciones que se disparan de verdad: postulación→empresa, resultado→candidato, mensaje→receptor, entrevista→candidato, verificación→empresa | ✅ |
| 2.14 | `POST /reportes` (la UI llega en Fases 4-5) | ✅ |
| 2.15 | `POST /auth/cambiar-password` (exige la password actual) | ✅ nuevo |

**Migración aplicada**: `Notificacion.usuario_id` → `Notificacion.cuenta_id` (destinatario genérico: usuarios Y empresas).
- `DB_KROW.sql` actualizado, `MIGRACION_001_notificacion.sql` (idempotente, para bases existentes), `SEED_KROW.sql` actualizado.
- Rutas de notificaciones sobre el token (sin mandar ids): `GET /`, `GET /no-leidas`, `PATCH /leidas`, `PATCH /:id/leida`.

**Verificación**: 15 pruebas de endpoints + flujo completo postulación→aceptación→chat→mensaje generando notificaciones en ambos sentidos; doble resolución de verificación → 409; cambio de password con actual incorrecta → 403.

---

## FASE 3 — Frontend desde cero: cimientos ✅ COMPLETADA
*Borra y reconstruye sobre las buenas ideas (tokens CSS, shad*er*, guards) pero con estructura limpia.*

| # | Tarea | Detalle |
|---|---|---|
| 3.1 | ✅ **Estructura nueva** por feature: `src/app/core/` (api, models, config, guards, interceptors), `src/app/shared/` (design system + `estilos/`), `src/app/layout/` (navbar, footer), `src/app/features/{public,usuario,empresa,admin}/`. Se elimina `components/` (20 stubs) y `app.spec.ts` roto (140 archivos movidos, 265 imports reparados) | rutas reescritas con lazy loading por feature |
| 3.2 | ✅ **Auth sólida**: al hacer login → `GET /auth/me` → guardar `id_cuenta`, `rol` **e id de perfil** (derivados `idUsuario`/`idEmpresa`). Un solo `AuthService` con signals como fuente de verdad + `authGuard` que espera a `/me` + `appInitializer`. Fin del bug `id_cuenta == id_usuario` | `core/api/auth.service.ts`, `core/auth/` |
| 3.3 | ✅ **Navbar nuevo**: reactiva a signals de `AuthService`, menú según rol (solo rutas existentes), campana con contador real (`GET /notificaciones/no-leidas`, refresco 60 s + al enfocar la ventana), **menú móvil (hamburguesa)**, sin enlaces muertos. Footer sin `href="#"`. Nuevas rutas públicas `/empresas` y `/empresas/:id` + `/empresa/notificaciones` para que ningún enlace quede colgado | `layout/navbar/`, `layout/footer/`, `features/public/empresas/`, `features/public/empresa-detalle/` |
| 3.4 | ✅ **Design system revisado** (`shared/`): conservados tokens de `styles.css` (Inter + Playfair, paleta, espaciados) y los componentes buenos. Corregido: labels accesibles (`for`↔`id` único por instancia + `aria-invalid`/`aria-describedby`/`role="alert"`) en `campo-input`/`campo-select`/`campo-textarea`, `[error]` conectado en login y ambos registros, `spinner` con archivos propios, **0 `@import` entre páginas** (los 5 casos pasan a `styleUrls` con `shared/estilos/{auth,pagina,chat}.css`) | `shared/` |
| 3.5 | ✅ Servicios HTTP: los 14 reescritos contra los endpoints de la Fase 2 (`buscar()`/`listar()` paginados, `alternar()`, `aplicar()`, `listarPropias()`, `contarNoLeidas()`, `resolver()` 3 args…); sin métodos muertos | `core/api/` |
| 3.6 | ✅ SSR **desactivado** → SPA pura (`@angular/ssr`, `server.ts`, `main.server.ts` e hydration fuera; scripts y `angular.json` simplificados) — Decisión 3 | `angular.json`, `package.json` |
| 3.7 | ✅ `tsconfig` en `strict` y sin `: any` en las páginas | `frontend/tsconfig.json` |

**Verificación de Fase 3** (22/09/2026):
1. `pnpm exec tsc --noEmit -p tsconfig.app.json` → **exit 0**.
2. `pnpm run build` (producción) → **exit 0** (compila incluyendo todos los templates).
3. Servidores en vivo: backend `:3000` y frontend `:4200` con proxy `/api`.
4. `GET /api/propuestas?buscar=&pagina=1` → 200, `total=7`, `empresa` embebida en cada fila.
5. Login USUARIO → `/auth/me` devuelve `rol` + `perfil.id_usuario` correcto.
6. Favoritos: `POST /toggle` sin `usuario_id` en el body → OK; listado enriquecido trae `empresa.nombre`/`empresa.verificada`.
7. Solicitud: `POST /solicitudes {"propuesta_id":2}` sin `usuario_id` → `id_solicitud` creado (y 409 si ya existía).
8. Notificaciones por token: `GET /notificaciones` → 2, `/no-leidas` → `{"total":1}`.
9. Conversaciones con `propuesta_nombre`, `empresa` y `no_leidos` en 1 sola query.
10. `GET /empresas?buscar=green&pagina=1` → paginado (`total=1`, GreenByte); `/empresas/2/con-propuestas` → 2 propuestas.
11. Perfil público `GET /usuarios/1/publico` → **sin `telefono` ni `direccion`** (solo campos públicos).
12. `POST /reportes` con `motivo`+`descripcion` y `usuario_id` desde el token → OK.
13. Candidato en `/api/verificaciones-empresa` → **403**.
14. Rutas del SPA en `:4200` → 200 en `/`, `/propuestas`, `/empresas`, `/empresas/2`, `/login`, `/registro/usuario`, `/registro/empresa`.
15. `@import` entre páginas → **0**; `href="#"` → **0**; labels con `for`↔`id` → OK.
16. Seed **restaurado** tras las pruebas (7 cuentas / 7 propuestas / 6 solicitudes / 1 reporte / 3 favoritos).

---

## FASE 4 — Vistas públicas (nuevo árbol `features/public/`) ✅ COMPLETADA

| # | Vista | Notas |
|---|---|---|
| 4.1 | ✅ **Landing**: hero, ofertas destacadas reales (empresa embebida, sin N+1), **stats REALES** (totales de `GET /propuestas` y `GET /empresas` con `por_pagina=1`; antes decía `1.200+/340+/8.500+/92%`, todas falsas), **"Cómo funciona" (3 pasos)**, **tipos de oportunidad** (los 4 enums), **CTA candidato + CTA empresa** | público joven: lenguaje cercano |
| 4.2 | ✅ **Login** con errores de formulario visibles (`[error]` conectado) | hecho en Fase 3.4 |
| 4.3 | ✅ **Registro usuario** y **registro empresa** con errores visibles | sin `@import` del CSS del login (Fase 3.4) |
| 4.4 | ✅ **Explorar ofertas**: búsqueda + filtros (5 tabs de tipo, modalidad) **paginados Y filtrados en el servidor** (antes el tipo se filtraba en cliente y la paginación mentía), favoritos, estados vacíos con "Limpiar filtros", lee `?tipo=` de la landing | Fase 2.9 |
| 4.5 | ✅ **Detalle de oferta**: 1 petición (propuesta+empresa), empresa verificada destacada, aplicar, favorito, **reportar oferta** con modal | sin `*ngIf` mezclado |
| 4.6 | ✅ **Listado de empresas** `/empresas`: búsqueda + "solo verificadas" + paginación servidor | Fase 2.8 |
| 4.7 | ✅ **Detalle de empresa** `/empresas/:id`: ficha, **verificación + nivel** (`PLATA`/`PLATINO`/`DIAMANTE` + estado y fecha, nuevo `findUltima()` en `VerificacionEmpresaRepository`), sus ofertas activas | Fase 2.8 |
| 4.8 | ✅ **404 real** (`features/public/no-encontrado/`): antes `path:'**' → redirectTo:''` redirigía al home | nuevo componente |

**Verificación de Fase 4** (22/09/2026):
1. Frontend `tsc --noEmit` → **0**; `ng build` → **0**; backend `tsc --noEmit` → **0**.
2. Rutas SPA → 200 en `/`, `/propuestas`, `/propuestas?tipo=PRACTICA`, `/empresas`, `/empresas/2`, `/empresas/999`, `/login`, `/ruta-que-no-existe`, `/admin/panel`.
3. `GET /empresas/2/con-propuestas` → GreenByte `verificada=1 nivel=DIAMANTE estado=APROBADA`; `/empresas/1` → TechLab `verificada=0 nivel=PLATINO estado=PENDIENTE`.
4. Filtro de tipo **en el servidor**: `TRABAJO→1`, `PRACTICA→2`, `PASANTIA→2`, `PREPRACTICA→1`, cada uno devolviendo solo filas de ese tipo (antes los totales no cuadraban con lo mostrado).
5. Stats reales de la landing: ofertas activas **6**, empresas **3**, verificadas **1** (cero números inventados en el HTML).
6. Destacadas con `empresa` embebida en la fila (sin petición extra de empresas).
7. El 404 ya **no redirige**: `path:'**'` carga `NoEncontradoPage`.
8. `git status`: 13 modificados + `features/public/no-encontrado/` nuevo.

---

## FASE 5 — Vistas USUARIO (`features/usuario/`) ✅ COMPLETADA

| # | Vista | Notas |
|---|---|---|
| 5.1 | ✅ Perfil (ver/editar) con **errores de formulario visibles** (`[error]` conectado) | **BUG corregido**: usaba `id_cuenta` donde el backend exige `id_usuario` → Ana (`cuenta=2, usuario=1`) cargaba el perfil de **Luis** y guardar daba 403. Ahora `auth.idUsuario()` |
| 5.2 | ✅ Curriculum (form con errores visibles: `portafolio` URL, `perfil_profesional` máx 600; aviso si el 404 = "aún no tienes CV") | **BUG corregido**: mismo `id_cuenta` → con la cuenta salía **403** en el GET |
| 5.3 | ✅ Mis solicitudes (nombre de oferta resuelto, **cancelar solicitud** con confirmación modal) | **Backend ajustado**: `PATCH /solicitudes/:id/estado` ahora acepta USUARIO pero **solo** con `CANCELADA` (403 si intenta otra cosa); el candidato solo cancela PENDIENTE/EN_REVISION |
| 5.4 | ✅ Guardados (1 query con propuesta+empresa, quitar favorito) | Fase 2.2 |
| 5.5 | ✅ **Mis entrevistas** *(nueva)* `/usuario/entrevistas`: fecha/hora/modalidad, enlace "Unirme", ubicación, observaciones; **aceptar** cambios (REPROGRAMADA→PROGRAMADA) y **rechazar** (→CANCELADA); ruta + enlace en navbar | Fase 2.5 · backend añadió `p.id_propuesta` al SELECT del candidato (para enlazar la oferta) |
| 5.6 | ✅ Notificaciones (lista + campana del navbar) | Fase 2.13 |
| 5.7 | ✅ Mensajes (sidebar con otro lado, oferta, último mensaje y no leídos en 1 query) | Fase 2.11 |
| 5.8 | ✅ **Reportar empresa/oferta**: modal en `/propuestas/:id` (oferta) y **nuevo modal en `/empresas/:id`** (`empresa_id`) | Fase 2.14 |

**Verificación de Fase 5** (22/09/2026):
1. Frontend `tsc --noEmit` → **0**; `ng build` → **0**; backend `tsc --noEmit` → **0**.
2. Login Ana → `GET /usuarios/1` → **Ana Perez, con teléfono** (ve SU perfil completo); control `GET /usuarios/2` → **Luis** (prueba de que confundir ids cargaba a otra persona).
3. `GET /curriculums/usuario/1` → 200 con su CV (antes 403 con `id_cuenta`).
4. `GET /entrevistas/usuario/1` → entrevista 1 con **`id_propuesta=1`**, empresa TechLab, enlace Jitsi.
5. Cancelar solicitud 2 (PENDIENTE) como USUARIO → **200**; intentar `ACEPTADA` como USUARIO → **403**; sin token → **401**.
6. `POST /reportes` con `empresa_id=1` → **201**; sin token → **401**.
7. Rutas SPA → 200 en `/usuario/entrevistas`, `/usuario/solicitudes`, `/usuario/perfil`, `/usuario/curriculum`, `/usuario/guardados`, `/usuario/notificaciones`, `/usuario/mensajes`.
8. **Seed restaurado** tras las pruebas: 7 cuentas / 7 propuestas / 6 solicitudes / 1 reporte / 3 favoritos (solicitud 2 de vuelta a PENDIENTE); `.tmp-seed.cjs` eliminado.

---

## FASE 6 — Vistas EMPRESA (`features/empresa/`) ✅ COMPLETADA

| # | Vista | Notas |
|---|---|---|
| 6.1 | ✅ Panel con **KPIs reales** (ofertas activas / solicitudes por revisar / entrevistas / verificación) + tabs mis ofertas / perfil | **sin `setTimeout`**: 4 peticiones en paralelo con `forkJoin` usando `auth.idEmpresa()` (antes bajaba TODA la lista de empresas para encontrar la propia); KPIs derivados con `computed` |
| 6.2 | ✅ Crear/editar oferta — **botón "Cancelar" arreglado** (antes disparaba `guardar()`) | además se quitó el `listar()` de empresas: el backend deriva `empresa_id` del token |
| 6.3 | ✅ Solicitudes **agrupadas por oferta** (sigue siendo 1 petición) + **ver perfil del candidato** *(nueva)*: modal con nombre, CV completo y **sus solicitudes a mis ofertas**, cacheado por `id_usuario` | Fase 2.4 + 2.12 (solo datos públicos: sin teléfono/dirección/fecha) |
| 6.4 | ✅ Entrevistas: programar + **reprogramar** (modal precargado → `PUT /:id/reprogramar` → estado REPROGRAMADA + notificación al candidato); nombre del candidato y la oferta visibles en cada tarjeta | Fase 2.6 · el método `reprogramar()` del servicio por fin usado |
| 6.5 | ✅ Verificación (planes + historial + estado: *Verificada* / *Solicitud en revisión* / *Sin verificar*) | **sin N+1**: `auth.idEmpresa()` + `obtenerPorId` en paralelo con el historial |
| 6.6 | ✅ Mensajes (sin cambios: sidebar + chat ya funcionaban) | Fase 2.11 |
| 6.7 | ✅ **Cambiar contraseña** en el panel (modal: actual + nueva + repetir; valida 8–72, confirmación y "distinta de la actual") | Fase 2.15 |

**BUG corregido (afectaba a 3 vistas)**: `PropuestaService.buscar` (front) no enviaba `pagina` y el backend solo pagina con `pagina`/`buscar` → devolvía **array plano** y `res.datos`/`res.total` eran `undefined`. Rompía las destacadas de la landing, el panel de la empresa y el panel del admin. Ahora `buscar()` envía `pagina` siempre (igual que `EmpresaService.buscar`); el panel además manda `estado: undefined` para ver ofertas de **todos** los estados.

**Verificación de Fase 6** (23/09/2026): **37/37 pruebas OK**
1. Frontend `tsc --noEmit` → **0**; `ng build` → **0**; backend `tsc --noEmit` → **0**.
2. Panel: `GET /empresas/1` → TechLab; `/propuestas?empresa_id=1&pagina=1&por_pagina=100` → **`{datos:4, total:4}`** (KPIs: 3 activas, 2/3 solicitudes por revisar, 1/1 entrevista); `/solicitudes/empresa/1` → 3; `/entrevistas/empresa/1` → 1; solicitudes sin token → **401**.
3. Destacadas de la landing: `/propuestas?estado=ACTIVA&pagina=1&por_pagina=3` → **`{datos, total:6}`** (antes array plano = crash de `res.datos.slice`).
4. Perfil público: `/usuarios/1/publico` con token → **Ana Perez con CV** y **sin teléfono**; sin token → 401.
5. Reprogramar: sin token → **401**; con token EMPRESA → **200** y la entrevista 1 queda **REPROGRAMADA** con la fecha nueva (con candidato y oferta resueltos).
6. Verificación: historial → 1 PENDIENTE; solicitar con pendiente existente → **409** "Ya tienes una solicitud pendiente" (regla anti-duplicados intacta).
7. Cambiar contraseña: actual incorrecta → **403**; nueva <8 → **400**; válida → **200** y login con la contraseña nueva → 200.
8. Mensajes (6.6): `/conversaciones` sin token → **401**; con token → resumen con oferta y candidato (1 conversación); `/mensajes/conversacion/1` → 3 mensajes; `PATCH .../leidos` → **200**; `POST /mensajes` → **201** y el mensaje aparece en el hilo (3 → 4).
9. Rutas SPA → 200 en `/empresa/panel`, `/empresa/solicitudes`, `/empresa/entrevistas`, `/empresa/verificacion`, `/empresa/mensajes`, `/empresa/propuestas/nueva`, `/empresa/propuestas/1/editar`.
10. **Seed restaurado** tras las pruebas: 7 cuentas / 7 propuestas / 6 solicitudes / 3 mensajes / entrevista 1 **PROGRAMADA** / solicitud 2 **PENDIENTE** / 2 verificaciones / 1 reporte / 3 favoritos; scripts `.tmp-*` eliminados.

---

## FASE 7 — Vistas ADMIN (`features/admin/`) ✅ COMPLETADA

| # | Vista | Notas |
|---|---|---|
| 7.1 | ✅ Panel: KPIs sin `setTimeout(500)` | 4 peticiones en paralelo con `forkJoin` (el `Promise.all` de RxJS) + cola global `?estado=PENDIENTE` en 1 query (antes: `setTimeout(500)` + 1 petición **por empresa** = N+1); propuestas con `estado: undefined` → total real de **todos** los estados |
| 7.2 | ✅ Verificaciones: cola global pendiente + aprobar/rechazar con observación (1 petición) | Fase 2.7 — ya construida; verificada en vivo: aprobar → empresa `verificada=1` + notificación a la empresa, doble resolución → 409, observación registrada |
| 7.3 | ✅ Empresas: listado con **acciones** — botón *Ver detalle* (→ `/empresas/:id`) y estado de verificación explícito (*Verificada* / *Sin verificar*) | antes solo lectura |
| 7.4 | ✅ Reportes: cola con filtros por estado + transiciones (`PENDIENTE → EN_REVISION → RESUELTO/DESCARTADO`) con validación backend (400 enum / 404 id); `getVarianteEstado` tipado con `VarianteBadge` | la UI de crear reporte está en Fases 4/5 |
| 7.5 | ✅ Cuentas: listado real paginado con búsqueda + activar/suspender/inactivar | Fase 2.10 · **BUG corregido**: el buscador leía el valor de un *input oculto* que siempre estaba vacío (lo que escribía el admin se perdía); ahora `[(ngModel)]` → `buscar()` → `GET /cuentas?buscar=` en el servidor |

**Verificación de Fase 7** (23/09/2026): **41/41 pruebas OK**
1. Frontend `tsc --noEmit` → **0**; `ng build` → **0**; backend `tsc --noEmit` → **0**.
2. Panel (7.1): las 4 peticiones del `forkJoin` → `/empresas` = 3 (1 verificada); `/propuestas?pagina=1&por_pagina=50` → `total=7` con **todos** los estados (6 activas); `/reportes` → 1; `/verificaciones-empresa?estado=PENDIENTE` → 1 con `empresa_nombre` resuelto (1 query, sin N+1, sin `setTimeout`).
3. Permisos: colas del admin sin token → **401**; `/cuentas` con token EMPRESA → **403**.
4. Verificaciones (7.2): estado inventado → **400**; aprobar verificación 1 → **200** (TechLab queda `verificada=1` y su empresa recibe la notificación "Verificacion aprobada"); doble resolución → **409**; cola pendiente queda **vacía**; filtro APROBADA → 2 con la observación registrada.
5. Reportes (7.4): filtros `?estado=` (PENDIENTE=1 → 0, EN_REVISION=0 → 1 tras la transición); transición → **200**; estado inventado → **400**; id inexistente → **404**; EMPRESA intentando transicionar → **403**.
6. Cuentas (7.5): paginado `{total:7, porPagina:15}`; buscar "ana" → 1 (`ana@correo.com`, con `id_usuario` resuelto), "TechLab" → 1, sin resultados → 0; `rol=EMPRESA` → 3; suspender → **200** con el estado reflejado; reactivar → **200**; estado inventado → **400**; sin token → **401**.
7. Rutas SPA → 200 en `/admin/panel`, `/admin/verificaciones`, `/admin/empresas`, `/admin/reportes`, `/admin/cuentas`.
8. **Seed restaurado** tras las pruebas: 7 cuentas / 7 propuestas / 6 solicitudes / 3 mensajes / entrevista 1 **PROGRAMADA** / solicitud 2 **PENDIENTE** / 2 verificaciones (verificación 1 de vuelta a **PENDIENTE**, TechLab `verificada=0`) / 1 reporte **PENDIENTE** / 3 favoritos; scripts `.tmp-*` eliminados.

---

## FASE 8 — Pulido y cierre

| # | Tarea |
|---|---|
| 8.1 | Páginas estáticas mínimas: Soporte/Contacto/Términos (hoy son `href="#"`) |
| 8.2 | Presupuestos de CSS por componente en `angular.json` (hoy 8kB de error) y revisar que ningún CSS lo rompa |
| 8.3 | Test de humo: arreglar/reescribir `app.spec.ts`, tests unitarios de los guards y del `AuthService` |
| 8.4 | QA manual por rol con el seed: recorrido completo **invitado → usuario → empresa → admin** |
| 8.5 | README con: cómo levantar BD + seed + backend + frontend, roles y credenciales de prueba |

---

## Orden de ejecución propuesto

```
Fase 0 (cimientos)  →  Fase 1 (seguridad)  →  Fase 2 (endpoints)
        →  Fase 3 (frontend base + auth + navbar + design system)
        →  Fase 4 → 5 → 6 → 7 (vistas)  →  Fase 8 (pulido)
```

Justificación: el frontend nuevo se construye **contra un backend ya seguro y con los endpoints agregados**, para no hacer las vistas dos veces.

---

## Decisiones tomadas (aprobadas)

1. **Estilo visual**: conservar la estética actual (Inter + Playfair, paleta KROW, tokens CSS); refrescar landing y navbar manteniendo coherencia.
2. **CSS**: CSS puro con tokens (sin Tailwind ni SCSS).
3. **SSR**: **desactivar SSR → SPA pura** (quitar `@angular/ssr`, `server.ts`, `main.server.ts`, hydration; scripts y `angular.json` simplificados).
4. **Notificaciones**: migrar `Notificacion.usuario_id` → **destinatario genérico** (cuenta_id), para que empresas también reciban avisos. Actualizar SQL, modelos backend y frontend.
5. **Contraseña**: solo **cambiar contraseña** desde el perfil autenticado (sin flujo de correo).
6. **Limpieza**: borrar ya los 20 stubs de `components/`, `app.spec.ts` roto y código muerto al empezar la Fase 3.
