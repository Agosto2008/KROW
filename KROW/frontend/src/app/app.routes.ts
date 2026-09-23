import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';
import { roleGuard } from './core/guards/role.guard';
import { MainLayout } from './shared/layouts/main-layout/main-layout';

export const routes: Routes = [
    // Auth: público
    { path: 'login', loadComponent: () => import('./features/auth/login/login').then(m => m.Login) },
    { path: 'registro/usuario', loadComponent: () => import('./features/auth/registro-usuario/registro-usuario').then(m => m.RegistroUsuario) },
    { path: 'registro/empresa', loadComponent: () => import('./features/auth/registro-empresa/registro-empresa').then(m => m.RegistroEmpresa) },
    {
        path: '',
        component: MainLayout,
        canActivate: [authGuard],
        children: [
            { path: '', redirectTo: 'propuestas', pathMatch: 'full' },

            // Propuestas (público dentro de la sesión)
            { path: 'propuestas', loadComponent: () => import('./features/propuestas/propuesta-list/propuesta-list').then(m => m.PropuestaList) },
            { path: 'propuestas/nueva', canActivate: [roleGuard('EMPRESA')], loadComponent: () => import('./features/propuestas/propuesta-form/propuesta-form').then(m => m.PropuestaForm) },
            { path: 'propuestas/:id/editar', canActivate: [roleGuard('EMPRESA')], loadComponent: () => import('./features/propuestas/propuesta-form/propuesta-form').then(m => m.PropuestaForm) },
            { path: 'propuestas/:id', loadComponent: () => import('./features/propuestas/propuesta-detail/propuesta-detail').then(m => m.PropuestaDetail) },

            // Empresa
            { path: 'mi-empresa', canActivate: [roleGuard('EMPRESA')], loadComponent: () => import('./features/empresa/perfil-empresa/perfil-empresa').then(m => m.PerfilEmpresa) },
            { path: 'mis-propuestas', canActivate: [roleGuard('EMPRESA')], loadComponent: () => import('./features/empresa/mis-propuestas/mis-propuestas').then(m => m.MisPropuestas) },

            // Usuario
            { path: 'mi-perfil', canActivate: [roleGuard('USUARIO')], loadComponent: () => import('./features/usuario/perfil-usuario/perfil-usuario').then(m => m.PerfilUsuario) },
            { path: 'mi-curriculum', canActivate: [roleGuard('USUARIO')], loadComponent: () => import('./features/usuario/curriculum-form/curriculum-form').then(m => m.CurriculumForm) },
            { path: 'mis-solicitudes', canActivate: [roleGuard('USUARIO')], loadComponent: () => import('./features/solicitudes/solicitud.list/solicitud-list').then(m => m.SolicitudList) },
            { path: 'favoritos', canActivate: [roleGuard('USUARIO')], loadComponent: () => import('./features/favoritos/favoritos-list/favorito-list').then(m => m.FavoritoList) },

            // Mensajería y notificaciones (cualquier rol)
            { path: 'conversaciones/:solicitudId', loadComponent: () => import('./features/mensajes/conversacion-view/conversacion-view').then(m => m.ConversacionView) },
            { path: 'notificaciones', loadComponent: () => import('./features/notificaciones/notificacion-list/notificacion-list').then(m => m.NotificacionList) },

            // Admin
            { path: 'admin/verificaciones', canActivate: [roleGuard('ADMIN')], loadComponent: () => import('./features/admin/verificaciones/verificaciones').then(m => m.Verificaciones) },
            { path: 'admin/reportes', canActivate: [roleGuard('ADMIN')], loadComponent: () => import('./features/admin/reportes/reportes').then(m => m.Reportes) },
            { path: 'admin', canActivate: [roleGuard('ADMIN')], loadComponent: () => import('./features/admin/dashboard/dashboard').then(m => m.Dashboard) },
        ]
    },

    { path: '**', redirectTo: 'propuestas' }
];