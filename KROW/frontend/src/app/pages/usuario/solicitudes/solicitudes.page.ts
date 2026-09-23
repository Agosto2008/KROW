import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { SolicitudService } from '../../../services/solicitud.service';
import { PropuestaService } from '../../../services/propuesta.service';
import { TokenStorageService } from '../../../core/token-storage.service';
import { Solicitud, Propuesta } from '../../../models/Index';
import { BadgeComponent } from '../../../shader/badge/badge.component';
import { EmptyStateComponent } from '../../../shader/empty-state/empty-state.component';
import { SpinnerComponent } from '../../../shader/spinner/spinner.component';

@Component({
  selector: 'app-solicitudes-page',
  standalone: true,
  imports: [CommonModule, RouterLink, BadgeComponent, EmptyStateComponent, SpinnerComponent],
  templateUrl: './solicitudes.page.html',
  styleUrl: './solicitudes.page.css',
})
export class SolicitudesPage implements OnInit {
  private readonly solicitudService = inject(SolicitudService);
  private readonly propuestaService = inject(PropuestaService);
  private readonly tokenStorage = inject(TokenStorageService);

  readonly solicitudes = signal<Solicitud[]>([]);
  readonly propuestas = signal<Record<number, Propuesta>>({});
  readonly cargando = signal(true);

  ngOnInit(): void {
    const id = this.tokenStorage.obtenerIdCuenta();
    if (!id) return;
    this.solicitudService.listarPorUsuario(id).subscribe({
      next: (solicitudes) => {
        this.solicitudes.set(solicitudes);
        this.cargarPropuestas(solicitudes);
        this.cargando.set(false);
      },
      error: () => this.cargando.set(false),
    });
  }

  private cargarPropuestas(solicitudes: Solicitud[]): void {
    const ids = [...new Set(solicitudes.map((s) => s.propuesta_id))];
    ids.forEach((pid) => {
      this.propuestaService.obtenerPorId(pid).subscribe({
        next: (p) => this.propuestas.update((map) => ({ ...map, [pid]: p })),
        error: () => {},
      });
    });
  }

  getVarianteEstado(estado: string): any {
    const mapa: Record<string, string> = {
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