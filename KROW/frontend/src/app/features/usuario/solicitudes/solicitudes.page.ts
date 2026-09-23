import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../../core/api/auth.service';
import { SolicitudService } from '../../../core/api/solicitud.service';
import { ToastService } from '../../../shared/toast/toast.service';
import { SolicitudConPropuesta } from '../../../core/models/Index';
import { BadgeComponent, VarianteBadge } from '../../../shared/badge/badge.component';
import { EmptyStateComponent } from '../../../shared/empty-state/empty-state.component';
import { SpinnerComponent } from '../../../shared/spinner/spinner.component';
import { ModalComponent } from '../../../shared/modal/modal.component';
import { BotonComponent } from '../../../shared/boton/boton.component';

@Component({
  selector: 'app-solicitudes-page',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    BadgeComponent,
    EmptyStateComponent,
    SpinnerComponent,
    ModalComponent,
    BotonComponent,
  ],
  templateUrl: './solicitudes.page.html',
  // shell de lista compartido (sin @import entre paginas)
  styleUrls: ['./solicitudes.page.css', '../../../shared/estilos/pagina.css'],
})
export class SolicitudesPage implements OnInit {
  private readonly solicitudService = inject(SolicitudService);
  private readonly auth = inject(AuthService);
  private readonly toast = inject(ToastService);

  /** Mis postulaciones con oferta + empresa resueltas en UNA query */
  readonly solicitudes = signal<SolicitudConPropuesta[]>([]);
  readonly cargando = signal(true);

  /** Confirmacion antes de cancelar (no hay vuelta atras) */
  readonly modalCancelarAbierto = signal(false);
  readonly cancelando = signal(false);
  private solicitudACancelar: SolicitudConPropuesta | null = null;

  ngOnInit(): void {
    const idUsuario = this.auth.idUsuario();
    if (!idUsuario) {
      this.cargando.set(false);
      return;
    }

    this.solicitudService.listarPorUsuario(idUsuario).subscribe({
      next: (sols) => { this.solicitudes.set(sols); this.cargando.set(false); },
      error: () => this.cargando.set(false),
    });
  }

  /** Solo cancelable mientras la empresa no resuelve: PENDIENTE o EN_REVISION */
  puedeCancelar(estado: string): boolean {
    return estado === 'PENDIENTE' || estado === 'EN_REVISION';
  }

  get solicitudACancelarVisible(): SolicitudConPropuesta | null {
    return this.modalCancelarAbierto() ? this.solicitudACancelar : null;
  }

  pedirCancelar(s: SolicitudConPropuesta): void {
    this.solicitudACancelar = s;
    this.modalCancelarAbierto.set(true);
  }

  cerrarModal(): void {
    if (this.cancelando()) return;
    this.modalCancelarAbierto.set(false);
    this.solicitudACancelar = null;
  }

  confirmarCancelar(): void {
    const s = this.solicitudACancelar;
    if (!s) return;

    this.cancelando.set(true);
    // el backend acepta CANCELADA solo para el candidato dueño
    this.solicitudService.cambiarEstado(s.id_solicitud, 'CANCELADA').subscribe({
      next: () => {
        this.solicitudes.update((lista) =>
          lista.map((x) =>
            x.id_solicitud === s.id_solicitud ? { ...x, estado: 'CANCELADA' } : x
          )
        );
        this.cancelando.set(false);
        this.modalCancelarAbierto.set(false);
        this.solicitudACancelar = null;
        this.toast.info('Solicitud cancelada');
      },
      error: (err) => {
        this.cancelando.set(false);
        this.toast.error(err.message || 'No se pudo cancelar la solicitud');
      },
    });
  }

  getVarianteEstado(estado: string): VarianteBadge {
    const mapa: Record<string, VarianteBadge> = {
      PENDIENTE: 'estado-pendiente',
      EN_REVISION: 'estado-revision',
      ACEPTADA: 'estado-aceptada',
      RECHAZADA: 'estado-rechazada',
      CANCELADA: 'estado-cancelada',
    };
    return mapa[estado] ?? 'neutro';
  }

  getEtiquetaEstado(estado: string): string {
    const mapa: Record<string, string> = {
      PENDIENTE: 'Pendiente',
      EN_REVISION: 'En revision',
      ACEPTADA: 'Aceptada',
      RECHAZADA: 'Rechazada',
      CANCELADA: 'Cancelada',
    };
    return mapa[estado] ?? estado;
  }
}
