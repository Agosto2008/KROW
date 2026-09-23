import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../../core/api/auth.service';
import { SolicitudService } from '../../../core/api/solicitud.service';
import { UsuarioService } from '../../../core/api/usuario.service';
import { ToastService } from '../../../shared/toast/toast.service';
import { SolicitudConCandidato, PerfilPublico, EstadoSolicitud } from '../../../core/models/Index';
import { BadgeComponent, VarianteBadge } from '../../../shared/badge/badge.component';
import { BotonComponent } from '../../../shared/boton/boton.component';
import { EmptyStateComponent } from '../../../shared/empty-state/empty-state.component';
import { SpinnerComponent } from '../../../shared/spinner/spinner.component';
import { ModalComponent } from '../../../shared/modal/modal.component';
import { CampoTextareaComponent } from '../../../shared/campo-textarea/campo-textarea.component';

@Component({
  selector: 'app-empresa-solicitudes-page',
  standalone: true,
  imports: [CommonModule, FormsModule, BadgeComponent, BotonComponent, EmptyStateComponent, SpinnerComponent, ModalComponent, CampoTextareaComponent],
  templateUrl: './solicitudes.page.html',
  styleUrl: './solicitudes.page.css',
})
export class EmpresaSolicitudesPage implements OnInit {
  private readonly auth = inject(AuthService);
  private readonly solicitudService = inject(SolicitudService);
  private readonly usuarioService = inject(UsuarioService);
  private readonly toast = inject(ToastService);

  /** Postulaciones a MIS ofertas con candidato + oferta en 1 query */
  readonly solicitudes = signal<SolicitudConCandidato[]>([]);
  readonly perfiles = signal<Record<number, PerfilPublico>>({});
  readonly cargando = signal(true);
  readonly modalAbierto = signal(false);
  readonly modalPerfilAbierto = signal(false);
  readonly cargandoPerfil = signal(false);
  /** comentario a enviar al candidato (two-way con ngModel) */
  comentarioTexto = '';
  readonly accionActual = signal<{ solicitud: SolicitudConCandidato; estado: EstadoSolicitud } | null>(null);

  ngOnInit(): void {
    const idEmpresa = this.auth.idEmpresa();
    if (!idEmpresa) {
      this.cargando.set(false);
      return;
    }

    this.solicitudService.listarPorEmpresa(idEmpresa).subscribe({
      next: (sols) => { this.solicitudes.set(sols); this.cargando.set(false); },
      error: () => this.cargando.set(false),
    });
  }

  getEtiquetaEstado(estado: string): string {
    const mapa: Record<string, string> = {
      PENDIENTE: 'Pendiente', EN_REVISION: 'En revisión',
      ACEPTADA: 'Aceptada', RECHAZADA: 'Rechazada', CANCELADA: 'Cancelada',
    };
    return mapa[estado] ?? estado;
  }

  getVarianteEstado(estado: string): VarianteBadge {
    const mapa: Record<string, VarianteBadge> = {
      PENDIENTE: 'estado-pendiente', EN_REVISION: 'estado-revision',
      ACEPTADA: 'estado-aceptada', RECHAZADA: 'estado-rechazada',
      CANCELADA: 'estado-cancelada',
    };
    return mapa[estado] ?? 'neutro';
  }

  nombreCandidato(s: SolicitudConCandidato): string {
    return [s.primer_nombre, s.segundo_nombre, s.primer_apellido, s.segundo_apellido]
      .filter(Boolean).join(' ') || 'Candidato';
  }

  /** Perfil público + CV del candidato (1 query, sin datos sensibles) */
  verPerfil(s: SolicitudConCandidato): void {
    if (this.perfiles()[s.id_usuario]) {
      this.modalPerfilAbierto.set(true);
      return;
    }
    this.cargandoPerfil.set(true);
    this.modalPerfilAbierto.set(true);
    this.usuarioService.obtenerPublico(s.id_usuario).subscribe({
      next: (p) => {
        this.perfiles.update((map) => ({ ...map, [s.id_usuario]: p }));
        this.cargandoPerfil.set(false);
      },
      error: () => {
        this.cargandoPerfil.set(false);
        this.modalPerfilAbierto.set(false);
        this.toast.error('No se pudo cargar el perfil');
      },
    });
  }

  cerrarPerfil(): void { this.modalPerfilAbierto.set(false); }

  abrirAccion(s: SolicitudConCandidato, estado: EstadoSolicitud): void {
    this.accionActual.set({ solicitud: s, estado });
    this.comentarioTexto = s.comentario_empresa ?? '';
    this.modalAbierto.set(true);
  }
  cerrarModal(): void { this.modalAbierto.set(false); this.accionActual.set(null); }

  confirmarAccion(): void {
    const acc = this.accionActual();
    if (!acc) return;
    this.solicitudService.cambiarEstado(acc.solicitud.id_solicitud, acc.estado, this.comentarioTexto).subscribe({
      next: () => {
        this.toast.exito('Solicitud actualizada');
        this.solicitudes.update((lista) =>
          lista.map((x) => x.id_solicitud === acc.solicitud.id_solicitud
            ? { ...x, estado: acc.estado, comentario_empresa: this.comentarioTexto }
            : x)
        );
        this.cerrarModal();
      },
      error: (err) => this.toast.error(err.message || 'No se pudo actualizar'),
    });
  }
}
