import { Component, inject, computed } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { LogoComponent } from '../logo/logo.component';
import { BotonComponent } from '../boton/boton.component';
import { TokenStorageService } from '../../core/token-storage.service';
import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';

interface ItemNav {
  etiqueta: string;
  ruta: string;
}

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive, LogoComponent, BotonComponent],
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.css',
})
export class NavbarComponent {
  private readonly tokenStorage = inject(TokenStorageService);
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  readonly rol = this.tokenStorage.obtenerRol;
  readonly autenticado = computed(() => this.tokenStorage.estaAutenticado());

  readonly itemsNav = computed<ItemNav[]>(() => {
    const rol = this.tokenStorage.obtenerRol();
    if (!rol) {
      return [
        { etiqueta: 'Explorar', ruta: '/propuestas' },
        { etiqueta: 'Empresas', ruta: '/empresas' },
      ];
    }

    if (rol === 'USUARIO') {
      return [
        { etiqueta: 'Explorar', ruta: '/propuestas' },
        { etiqueta: 'Guardados', ruta: '/usuario/guardados' },
        { etiqueta: 'Mi perfil', ruta: '/usuario/perfil' },
        { etiqueta: 'Mensajes', ruta: '/usuario/mensajes' },
      ];
    }

    if (rol === 'EMPRESA') {
      return [
        { etiqueta: 'Mis ofertas', ruta: '/empresa/panel' },
        { etiqueta: 'Solicitudes', ruta: '/empresa/solicitudes' },
        { etiqueta: 'Entrevistas', ruta: '/empresa/entrevistas' },
        { etiqueta: 'Perfil empresa', ruta: '/empresa/perfil' },
      ];
    }

    if (rol === 'ADMIN') {
      return [
        { etiqueta: 'Verificaciones', ruta: '/admin/verificaciones' },
        { etiqueta: 'Empresas', ruta: '/admin/empresas' },
        { etiqueta: 'Reportes', ruta: '/admin/reportes' },
        { etiqueta: 'Estadísticas', ruta: '/admin/panel' },
      ];
    }

    return [];
  });

  cerrarSesion(): void {
    this.authService.logout();
    this.router.navigate(['/']);
  }
}