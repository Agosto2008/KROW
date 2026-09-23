import { Component, inject, computed, signal, OnInit, OnDestroy, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { Subscription, interval } from 'rxjs';
import { LogoComponent } from '../../shared/logo/logo.component';
import { BotonComponent } from '../../shared/boton/boton.component';
import { AuthService } from '../../core/api/auth.service';
import { NotificacionService } from '../../core/api/notificacion.service';

interface ItemNav {
  etiqueta: string;
  ruta: string;
}

/**
 * Barra de navegación reactiva.
 *
 * - Lee SIEMPRE de los signals de AuthService (nunca de localStorage directo),
 *   así reacciona a login/logout y a la carga de /auth/me.
 * - Hamburguesa para móvil.
 * - Campana con el contador de no leídas (GET /notificaciones/no-leidas),
 *   consultado al montar y cada 60 s mientras haya sesión.
 */
@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive, LogoComponent, BotonComponent],
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.css',
})
export class NavbarComponent implements OnInit, OnDestroy {
  private readonly auth = inject(AuthService);
  private readonly notificacionService = inject(NotificacionService);
  private readonly router = inject(Router);

  readonly rol = this.auth.rol;
  readonly autenticado = this.auth.autenticado;
  readonly nombreVisible = this.auth.nombreVisible;

  readonly menuAbierto = signal(false);
  readonly noLeidas = signal(0);

  /** La campana solo aparece cuando la sesión ya está resuelta */
  readonly veCampana = computed(
    () => this.autenticado() && this.rol() !== null && this.rol() !== 'ADMIN'
  );

  readonly itemsNav = computed<ItemNav[]>(() => {
    const rol = this.rol();

    if (!rol) {
      return [
        { etiqueta: 'Explorar', ruta: '/propuestas' },
        { etiqueta: 'Empresas', ruta: '/empresas' },
      ];
    }

    if (rol === 'USUARIO') {
      return [
        { etiqueta: 'Explorar', ruta: '/propuestas' },
        { etiqueta: 'Empresas', ruta: '/empresas' },
        { etiqueta: 'Guardados', ruta: '/usuario/guardados' },
        { etiqueta: 'Solicitudes', ruta: '/usuario/solicitudes' },
        { etiqueta: 'Mensajes', ruta: '/usuario/mensajes' },
      ];
    }

    if (rol === 'EMPRESA') {
      return [
        { etiqueta: 'Mis ofertas', ruta: '/empresa/panel' },
        { etiqueta: 'Solicitudes', ruta: '/empresa/solicitudes' },
        { etiqueta: 'Entrevistas', ruta: '/empresa/entrevistas' },
        { etiqueta: 'Mensajes', ruta: '/empresa/mensajes' },
        { etiqueta: 'Verificación', ruta: '/empresa/verificacion' },
      ];
    }

    if (rol === 'ADMIN') {
      return [
        { etiqueta: 'Estadísticas', ruta: '/admin/panel' },
        { etiqueta: 'Verificaciones', ruta: '/admin/verificaciones' },
        { etiqueta: 'Empresas', ruta: '/admin/empresas' },
        { etiqueta: 'Reportes', ruta: '/admin/reportes' },
        { etiqueta: 'Cuentas', ruta: '/admin/cuentas' },
      ];
    }

    return [];
  });

  /** Ruta de la bandeja de notificaciones según el rol */
  get rutaNotificaciones(): string {
    return this.rol() === 'EMPRESA' ? '/empresa/notificaciones' : '/usuario/notificaciones';
  }

  /** Ruta del perfil/panel propio según el rol */
  get rutaPerfil(): string {
    switch (this.rol()) {
      case 'USUARIO': return '/usuario/perfil';
      case 'EMPRESA': return '/empresa/panel';
      case 'ADMIN': return '/admin/panel';
      default: return '/';
    }
  }

  private sub?: Subscription;

  ngOnInit(): void {
    this.consultarNoLeidas();

    // refresco periódico del contador mientras haya sesión
    this.sub = interval(60_000).subscribe(() => this.consultarNoLeidas());
  }

  ngOnDestroy(): void {
    this.sub?.unsubscribe();
  }

  /** Vuelve a pedir el contador (también al hacer login en otra pestaña) */
  @HostListener('window:focus')
  alEnfocarVentana(): void {
    this.consultarNoLeidas();
  }

  private consultarNoLeidas(): void {
    if (!this.veCampana()) {
      this.noLeidas.set(0);
      return;
    }

    this.notificacionService.contarNoLeidas().subscribe({
      next: (res) => this.noLeidas.set(res.total ?? 0),
      // sin sesión o error de red: simplemente no se muestra el contador
      error: () => this.noLeidas.set(0),
    });
  }

  alternarMenu(): void {
    this.menuAbierto.update((v) => !v);
  }

  cerrarMenu(): void {
    this.menuAbierto.set(false);
  }

  /** Cierra el menú móvil al navegar */
  navegar(): void {
    this.cerrarMenu();
  }

  cerrarSesion(): void {
    this.cerrarMenu();
    this.auth.logout();
    this.router.navigate(['/']);
  }
}
