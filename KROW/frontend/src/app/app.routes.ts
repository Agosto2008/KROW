import { Routes } from '@angular/router';
import { authGuard } from './core/auth.guard';
import { roleGuard } from './core/role.guard';

export const routes: Routes = [
  // ============================================
  // Públicas
  // ============================================
  {
    path: '',
    loadComponent: () =>
      import('./features/public/landing/landing.page').then((m) => m.LandingPage),
    title: 'KROW — Tu primer trabajo no debería ser una lotería',
  },
  {
    path: 'login',
    loadComponent: () =>
      import('./features/public/login/login.page').then((m) => m.LoginPage),
    title: 'Iniciar sesión — KROW',
  },
  {
    path: 'registro/usuario',
    loadComponent: () =>
      import('./features/public/registro-usuario/registro-usuario.page').then(
        (m) => m.RegistroUsuarioPage
      ),
    title: 'Registro de usuario — KROW',
  },
  {
    path: 'registro/empresa',
    loadComponent: () =>
      import('./features/public/registro-empresa/registro-empresa.page').then(
        (m) => m.RegistroEmpresaPage
      ),
    title: 'Registro de empresa — KROW',
  },
  {
    path: 'propuestas',
    loadComponent: () =>
      import('./features/public/explorar/explorar.page').then((m) => m.ExplorarPage),
    title: 'Explorar ofertas — KROW',
  },
  {
    path: 'propuestas/:id',
    loadComponent: () =>
      import('./features/public/propuesta-detalle/propuesta-detalle.page').then(
        (m) => m.PropuestaDetallePage
      ),
    title: 'Detalle de oferta — KROW',
  },
  {
    path: 'empresas',
    loadComponent: () =>
      import('./features/public/empresas/empresas.page').then((m) => m.EmpresasPage),
    title: 'Empresas — KROW',
  },
  {
    path: 'empresas/:id',
    loadComponent: () =>
      import('./features/public/empresa-detalle/empresa-detalle.page').then(
        (m) => m.EmpresaDetallePage
      ),
    title: 'Perfil de empresa — KROW',
  },

  // ============================================
  // Usuario (rol USUARIO)
  // ============================================
  {
    path: 'usuario/perfil',
    canActivate: [authGuard, roleGuard(['USUARIO'])],
    loadComponent: () =>
      import('./features/usuario/perfil/perfil.page').then((m) => m.PerfilPage),
    title: 'Mi perfil — KROW',
  },
  {
    path: 'usuario/curriculum',
    canActivate: [authGuard, roleGuard(['USUARIO'])],
    loadComponent: () =>
      import('./features/usuario/curriculum/curriculum.page').then(
        (m) => m.CurriculumPage
      ),
    title: 'Mi currículum — KROW',
  },
  {
    path: 'usuario/solicitudes',
    canActivate: [authGuard, roleGuard(['USUARIO'])],
    loadComponent: () =>
      import('./features/usuario/solicitudes/solicitudes.page').then(
        (m) => m.SolicitudesPage
      ),
    title: 'Mis solicitudes — KROW',
  },
  {
    path: 'usuario/guardados',
    canActivate: [authGuard, roleGuard(['USUARIO'])],
    loadComponent: () =>
      import('./features/usuario/guardados/guardados.page').then(
        (m) => m.GuardadosPage
      ),
    title: 'Ofertas guardadas — KROW',
  },
  {
    path: 'usuario/entrevistas',
    canActivate: [authGuard, roleGuard(['USUARIO'])],
    loadComponent: () =>
      import('./features/usuario/entrevistas/entrevistas.page').then(
        (m) => m.UsuarioEntrevistasPage
      ),
    title: 'Mis entrevistas — KROW',
  },
  {
    path: 'usuario/notificaciones',
    canActivate: [authGuard, roleGuard(['USUARIO'])],
    loadComponent: () =>
      import('./features/usuario/notificaciones/notificaciones.page').then(
        (m) => m.NotificacionesPage
      ),
    title: 'Notificaciones — KROW',
  },
  {
    path: 'usuario/mensajes',
    canActivate: [authGuard, roleGuard(['USUARIO'])],
    loadComponent: () =>
      import('./features/usuario/mensajes/mensajes.page').then(
        (m) => m.MensajesPage
      ),
    title: 'Mensajes — KROW',
  },

  // ============================================
  // Empresa (rol EMPRESA)
  // ============================================
  {
    path: 'empresa/panel',
    canActivate: [authGuard, roleGuard(['EMPRESA'])],
    loadComponent: () =>
      import('./features/empresa/panel/panel.page').then(
        (m) => m.EmpresaPanelPage
      ),
    title: 'Panel de empresa — KROW',
  },
  {
    path: 'empresa/propuestas/nueva',
    canActivate: [authGuard, roleGuard(['EMPRESA'])],
    loadComponent: () =>
      import('./features/empresa/propuesta-form/propuesta-form.page').then(
        (m) => m.PropuestaFormPage
      ),
    title: 'Nueva oferta — KROW',
  },
  {
    path: 'empresa/propuestas/:id/editar',
    canActivate: [authGuard, roleGuard(['EMPRESA'])],
    loadComponent: () =>
      import('./features/empresa/propuesta-form/propuesta-form.page').then(
        (m) => m.PropuestaFormPage
      ),
    title: 'Editar oferta — KROW',
  },
  {
    path: 'empresa/solicitudes',
    canActivate: [authGuard, roleGuard(['EMPRESA'])],
    loadComponent: () =>
      import('./features/empresa/solicitudes/solicitudes.page').then(
        (m) => m.EmpresaSolicitudesPage
      ),
    title: 'Solicitudes recibidas — KROW',
  },
  {
    path: 'empresa/entrevistas',
    canActivate: [authGuard, roleGuard(['EMPRESA'])],
    loadComponent: () =>
      import('./features/empresa/entrevistas/entrevistas.page').then(
        (m) => m.EmpresaEntrevistasPage
      ),
    title: 'Entrevistas — KROW',
  },
  {
    path: 'empresa/verificacion',
    canActivate: [authGuard, roleGuard(['EMPRESA'])],
    loadComponent: () =>
      import('./features/empresa/verificacion/verificacion.page').then(
        (m) => m.EmpresaVerificacionPage
      ),
    title: 'Verificación — KROW',
  },
  {
    path: 'empresa/mensajes',
    canActivate: [authGuard, roleGuard(['EMPRESA'])],
    loadComponent: () =>
      import('./features/empresa/mensajes/mensajes.page').then(
        (m) => m.EmpresaMensajesPage
      ),
    title: 'Mensajes — KROW',
  },
  {
    // misma bandeja que el candidato: Notificacion se resuelve por token,
    // así que el componente sirve para ambos roles
    path: 'empresa/notificaciones',
    canActivate: [authGuard, roleGuard(['EMPRESA'])],
    loadComponent: () =>
      import('./features/usuario/notificaciones/notificaciones.page').then(
        (m) => m.NotificacionesPage
      ),
    title: 'Notificaciones — KROW',
  },

  // ============================================
  // Admin (rol ADMIN)
  // ============================================
  {
    path: 'admin/panel',
    canActivate: [authGuard, roleGuard(['ADMIN'])],
    loadComponent: () =>
      import('./features/admin/panel/panel.page').then((m) => m.AdminPanelPage),
    title: 'Panel de administración — KROW',
  },
  {
    path: 'admin/verificaciones',
    canActivate: [authGuard, roleGuard(['ADMIN'])],
    loadComponent: () =>
      import('./features/admin/verificaciones/verificaciones.page').then(
        (m) => m.AdminVerificacionesPage
      ),
    title: 'Verificaciones — KROW',
  },
  {
    path: 'admin/empresas',
    canActivate: [authGuard, roleGuard(['ADMIN'])],
    loadComponent: () =>
      import('./features/admin/empresas/empresas.page').then(
        (m) => m.AdminEmpresasPage
      ),
    title: 'Empresas — KROW',
  },
  {
    path: 'admin/reportes',
    canActivate: [authGuard, roleGuard(['ADMIN'])],
    loadComponent: () =>
      import('./features/admin/reportes/reportes.page').then(
        (m) => m.AdminReportesPage
      ),
    title: 'Reportes — KROW',
  },
  {
    path: 'admin/cuentas',
    canActivate: [authGuard, roleGuard(['ADMIN'])],
    loadComponent: () =>
      import('./features/admin/cuentas/cuentas.page').then(
        (m) => m.AdminCuentasPage
      ),
    title: 'Cuentas — KROW',
  },

  // ============================================
  // 404
  // ============================================
  {
    // 404 REAL: se muestra en la URL inexistente en vez de redirigir al home
    path: '**',
    loadComponent: () =>
      import('./features/public/no-encontrado/no-encontrado.page').then(
        (m) => m.NoEncontradoPage
      ),
    title: 'Página no encontrada — KROW',
  },
];