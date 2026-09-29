import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../../core/api/auth.service';
import { EntrevistaService } from '../../../core/api/entrevista.service';
import { ToastService } from '../../../shared/toast/toast.service';
import { EntrevistaConPropuesta, EstadoEntrevista } from '../../../core/models/Index';
import { BadgeComponent, VarianteBadge } from '../../../shared/badge/badge.component';
import { BotonComponent } from '../../../shared/boton/boton.component';
import { EmptyStateComponent } from '../../../shared/empty-state/empty-state.component';
import { SpinnerComponent } from '../../../shared/spinner/spinner.component';

/**
 * Mis entrevistas (5.5).
 *
 * Acciones del candidato sobre los estados del backend
 * (PROGRAMADA / REPROGRAMADA / REALIZADA / CANCELADA):
 *  - REPROGRAMADA -> "Aceptar cambios" (vuelve a PROGRAMADA) o "Rechazar" (CANCELADA)
 *  - PROGRAMADA   -> "Rechazar" (CANCELADA)
 *  - REALIZADA / CANCELADA -> sin acciones (ya cerradas)
 */
@Component({
  selector: 'app-usuario-entrevistas-page',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    BadgeComponent,
    BotonComponent,
    EmptyStateComponent,
    SpinnerComponent,
  ],
  templateUrl: './entrevistas.page.html',
  styleUrls: ['./entrevistas.page.css', '../../../shared/estilos/pagina.css'],
})
export class UsuarioEntrevistasPage implements OnInit {
  private readonly auth = inject(AuthService);
  private readonly entrevistaService = inject(EntrevistaService);
  private readonly toast = inject(ToastService);

  /** Mis entrevistas con oferta + empresa resueltas en 1 query */
  readonly entrevistas = signal<EntrevistaConPropuesta[]>([]);
  readonly cargando = signal(true);
  readonly procesandoId = signal<number | null>(null);

  ngOnInit(): void {
    const idUsuario = this.auth.idUsuario();
    if (!idUsuario) {
      this.cargando.set(false);
      return;
    }

    this.entrevistaService.listarPorUsuario(idUsuario).subscribe({
      next: (ee) => { this.entrevistas.set(ee); this.cargando.set(false); },
      error: () => this.cargando.set(false),
    });
  }

  cambiarEstado(id: number, estado: EstadoEntrevista, aviso: string): void {
    if (this.procesandoId() !== null) return;
    this.procesandoId.set(id);

    this.entrevistaService.cambiarEstado(id, estado).subscribe({
      next: () => {
        this.entrevistas.update((lista) =>
          lista.map((e) => (e.id_entrevista === id ? { ...e, estado } : e))
        );
        this.procesandoId.set(null);
        this.toast.exito(aviso);
      },
      error: (err) => {
        this.procesandoId.set(null);
        this.toast.error(err.message || 'No se pudo actualizar la entrevista');
      },
    });
  }

  /** Abrir el enlace de la entrevista en otra pestaña */
  abrirEnlace(enlace: string): void {
    window.open(enlace, '_blank', 'noopener');
  }

  getVarianteEstado(estado: string): VarianteBadge {
    const mapa: Record<string, VarianteBadge> = {
      PROGRAMADA: 'estado-pendiente',
      REPROGRAMADA: 'estado-revision',
      REALIZADA: 'estado-aceptada',
      CANCELADA: 'estado-rechazada',
    };
    return mapa[estado] ?? 'neutro';
  }

  getEtiquetaEstado(estado: string): string {
    const mapa: Record<string, string> = {
      PROGRAMADA: 'Programada',
      REPROGRAMADA: 'Reprogramada',
      REALIZADA: 'Realizada',
      CANCELADA: 'Cancelada',
    };
    return mapa[estado] ?? estado;
  }

  getEtiquetaModalidad(modalidad: string | null): string {
    const mapa: Record<string, string> = {
      PRESENCIAL: 'Presencial',
      VIRTUAL: 'Virtual',
      TELEFONICA: 'Telefonica',
    };
    return modalidad ? mapa[modalidad] ?? modalidad : 'Sin definir';
  }
}
