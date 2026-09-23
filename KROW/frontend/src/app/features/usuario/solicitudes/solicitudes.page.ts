import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../../core/api/auth.service';
import { SolicitudService } from '../../../core/api/solicitud.service';
import { SolicitudConPropuesta } from '../../../core/models/Index';
import { BadgeComponent, VarianteBadge } from '../../../shared/badge/badge.component';
import { EmptyStateComponent } from '../../../shared/empty-state/empty-state.component';
import { SpinnerComponent } from '../../../shared/spinner/spinner.component';

@Component({
  selector: 'app-solicitudes-page',
  standalone: true,
  imports: [CommonModule, RouterLink, BadgeComponent, EmptyStateComponent, SpinnerComponent],
  templateUrl: './solicitudes.page.html',
  // shell de lista compartido (sin @import entre páginas)
  styleUrls: ['./solicitudes.page.css', '../../../shared/estilos/pagina.css'],
})
export class SolicitudesPage implements OnInit {
  private readonly solicitudService = inject(SolicitudService);
  private readonly auth = inject(AuthService);

  /** Mis postulaciones con oferta + empresa resueltas en UNA query */
  readonly solicitudes = signal<SolicitudConPropuesta[]>([]);
  readonly cargando = signal(true);

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
      EN_REVISION: 'En revisión',
      ACEPTADA: 'Aceptada',
      RECHAZADA: 'Rechazada',
      CANCELADA: 'Cancelada',
    };
    return mapa[estado] ?? estado;
  }
}
