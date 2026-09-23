import { Component, inject, signal, OnInit } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { PropuestaService } from '../../services/propuesta.service';
import { EmpresaService } from '../../services/empresa.service';
import { SolicitudService } from '../../services/solicitud.service';
import { FavoritoService } from '../../services/favorito.service';
import { UsuarioService } from '../../services/usuario.service';
import { TokenStorageService } from '../../core/token-storage.service';
import { ToastService } from '../../shader/toast/toast.service';
import { Propuesta, Empresa } from '../../models/Index';
import { BotonComponent } from '../../shader/boton/boton.component';
import { BadgeComponent } from '../../shader/badge/badge.component';
import { AvatarEmpresaComponent } from '../../shader/avatar-empresa/avatar-empresa.component';
import { SpinnerComponent } from '../../shader/spinner/spinner.component';
import { EmptyStateComponent } from '../../shader/empty-state/empty-state.component';

@Component({
  selector: 'app-propuesta-detalle-page',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    BotonComponent,
    BadgeComponent,
    AvatarEmpresaComponent,
    SpinnerComponent,
    EmptyStateComponent,
  ],
  templateUrl: './propuesta-detalle.page.html',
  styleUrl: './propuesta-detalle.page.css',
})
export class PropuestaDetallePage implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly propuestaService = inject(PropuestaService);
  private readonly empresaService = inject(EmpresaService);
  private readonly solicitudService = inject(SolicitudService);
  private readonly favoritoService = inject(FavoritoService);
  private readonly usuarioService = inject(UsuarioService);
  private readonly tokenStorage = inject(TokenStorageService);
  private readonly toast = inject(ToastService);

  readonly propuesta = signal<Propuesta | null>(null);
  readonly empresa = signal<Empresa | null>(null);
  readonly cargando = signal(true);
  readonly esFavorito = signal(false);
  readonly aplicando = signal(false);

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    if (!id) {
      this.router.navigate(['/propuestas']);
      return;
    }
    this.cargar(id);
  }

  private cargar(id: number): void {
    this.propuestaService.obtenerPorId(id).subscribe({
      next: (propuesta) => {
        this.propuesta.set(propuesta);
        this.empresaService.obtenerPorId(propuesta.empresa_id).subscribe({
          next: (empresa) => this.empresa.set(empresa),
          error: () => {},
        });
        this.cargando.set(false);
      },
      error: () => {
        this.cargando.set(false);
        this.toast.error('No se encontró la propuesta');
        this.router.navigate(['/propuestas']);
      },
    });

    const idUsuario = this.tokenStorage.obtenerIdCuenta();
    if (idUsuario) {
      this.favoritoService.listar(idUsuario).subscribe({
        next: (favs) => this.esFavorito.set(favs.some((f) => f.propuesta_id === id)),
        error: () => {},
      });
    }
  }

  get etiquetaTipo(): string {
    const p = this.propuesta();
    if (!p) return '';
    const mapa: Record<string, string> = {
      PREPRACTICA: 'Prepráctica',
      PRACTICA: 'Prácticas',
      PASANTIA: 'Pasantía',
      TRABAJO: 'Trabajo',
    };
    return mapa[p.tipo] ?? p.tipo;
  }

  get pagoTexto(): string {
    const p = this.propuesta();
    if (!p || p.pago == null) return 'No remunerado';
    return `${p.pago} €/mes`;
  }

  onAplicar(): void {
    const p = this.propuesta();
    const idUsuarioCuenta = this.tokenStorage.obtenerIdCuenta();
    const rol = this.tokenStorage.obtenerRol();

    if (!idUsuarioCuenta || rol !== 'USUARIO') {
      this.toast.info('Inicia sesión como usuario para aplicar');
      this.router.navigate(['/login']);
      return;
    }
    if (!p) return;

    // El backend espera usuario_id (no id_cuenta). Usamos /usuarios/:id con id_cuenta
    // hasta que exista endpoint /me. Fallback: si el back no soporta, mostrará error.
    this.aplicando.set(true);
    // Asumimos que el id de cuenta == id de usuario en este punto;
    // cuando el back devuelva /me lo ajustamos.
    this.solicitudService.aplicar(idUsuarioCuenta, p.id_propuesta).subscribe({
      next: () => {
        this.aplicando.set(false);
        this.toast.exito('¡Solicitud enviada!');
      },
      error: (err) => {
        this.aplicando.set(false);
        this.toast.error(err.message || 'No se pudo aplicar');
      },
    });
  }

  onToggleFavorito(): void {
    const p = this.propuesta();
    const idUsuario = this.tokenStorage.obtenerIdCuenta();
    if (!p || !idUsuario) {
      this.toast.info('Inicia sesión para guardar ofertas');
      return;
    }
    this.favoritoService.alternar(idUsuario, p.id_propuesta).subscribe({
      next: (res) => {
        const ahoraFav = res.mensaje === 'agregado';
        this.esFavorito.set(ahoraFav);
        this.toast.exito(ahoraFav ? 'Guardado' : 'Eliminado de guardados');
      },
      error: () => this.toast.error('No se pudo actualizar'),
    });
  }
}