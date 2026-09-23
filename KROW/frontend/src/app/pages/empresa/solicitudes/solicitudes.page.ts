import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormsModule } from '@angular/forms';
import { EmpresaService } from '../../../services/empresa.service';
import { PropuestaService } from '../../../services/propuesta.service';
import { SolicitudService } from '../../../services/solicitud.service';
import { UsuarioService } from '../../../services/usuario.service';
import { TokenStorageService } from '../../../core/token-storage.service';
import { ToastService } from '../../../shader/toast/toast.service';
import { Empresa, Propuesta, Solicitud, Usuario, EstadoSolicitud } from '../../../models/Index';
import { BadgeComponent } from '../../../shader/badge/badge.component';
import { BotonComponent } from '../../../shader/boton/boton.component';
import { EmptyStateComponent } from '../../../shader/empty-state/empty-state.component';
import { SpinnerComponent } from '../../../shader/spinner/spinner.component';
import { ModalComponent } from '../../../shader/modal/modal.component';
import { CampoTextareaComponent } from '../../../shader/campo-textarea/campo-textarea.component';

@Component({
  selector: 'app-empresa-solicitudes-page',
  standalone: true,
  imports: [CommonModule, FormsModule, BadgeComponent, BotonComponent, EmptyStateComponent, SpinnerComponent, ModalComponent, CampoTextareaComponent],
  templateUrl: './solicitudes.page.html',
  styleUrl: './solicitudes.page.css',
})
export class EmpresaSolicitudesPage implements OnInit {
  private readonly empresaService = inject(EmpresaService);
  private readonly propuestaService = inject(PropuestaService);
  private readonly solicitudService = inject(SolicitudService);
  private readonly usuarioService = inject(UsuarioService);
  private readonly tokenStorage = inject(TokenStorageService);
  private readonly toast = inject(ToastService);

  readonly propuestas = signal<Propuesta[]>([]);
  readonly solicitudes = signal<Solicitud[]>([]);
  readonly usuarios = signal<Record<number, Usuario>>({});
  readonly propuestasMap = signal<Record<number, Propuesta>>({});
  readonly cargando = signal(true);
  readonly modalAbierto = signal(false);
  readonly comentario = signal('');
  readonly accionActual = signal<{ solicitud: Solicitud; estado: EstadoSolicitud } | null>(null);

  ngOnInit(): void {
    const id = this.tokenStorage.obtenerIdCuenta();
    if (!id) return;

    this.empresaService.listar().subscribe({
      next: (empresas) => {
        const mia = empresas.find((e) => e.cuenta_id === id) ?? null;
        if (!mia) { this.cargando.set(false); return; }
        this.cargarPropuestas(mia.id_empresa);
      },
      error: () => this.cargando.set(false),
    });
  }

  private cargarPropuestas(empresaId: number): void {
    this.propuestaService.listar({ empresa_id: empresaId }).subscribe({
      next: (props) => {
        this.propuestas.set(props);
        const map: Record<number, Propuesta> = {};
        props.forEach((p) => (map[p.id_propuesta] = p));
        this.propuestasMap.set(map);
        this.cargarSolicitudes(props.map((p) => p.id_propuesta));
      },
      error: () => this.cargando.set(false),
    });
  }

  private cargarSolicitudes(propuestaIds: number[]): void {
    if (propuestaIds.length === 0) { this.cargando.set(false); return; }
    let pendientes = propuestaIds.length;
    propuestaIds.forEach((pid) => {
      this.solicitudService.listarPorPropuesta(pid).subscribe({
        next: (ss) => {
          this.solicitudes.update((lista) => [...lista, ...ss]);
          ss.forEach((s) => this.cargarUsuario(s.usuario_id));
        },
        error: () => {},
        complete: () => { if (--pendientes === 0) this.cargando.set(false); },
      });
    });
  }

  private cargarUsuario(uid: number): void {
    if (this.usuarios()[uid]) return;
    this.usuarioService.obtenerPorId(uid).subscribe({
      next: (u) => this.usuarios.update((map) => ({ ...map, [uid]: u })),
      error: () => {},
    });
  }

  nombreUsuario(uid: number): string {
    const u = this.usuarios()[uid];
    if (!u) return 'Usuario';
    return [u.primer_nombre, u.primer_apellido].filter(Boolean).join(' ');
  }

  getEtiquetaEstado(estado: string): string {
    const mapa: Record<string, string> = {
      PENDIENTE: 'Pendiente', EN_REVISION: 'En revisión',
      ACEPTADA: 'Aceptada', RECHAZADA: 'Rechazada', CANCELADA: 'Cancelada',
    };
    return mapa[estado] ?? estado;
  }
  getVarianteEstado(estado: string): any {
    const mapa: Record<string, string> = {
      PENDIENTE: 'estado-pendiente', EN_REVISION: 'estado-revision',
      ACEPTADA: 'estado-aceptada', RECHAZADA: 'estado-rechazada', CANCELADA: 'estado-cancelada',
    };
    return mapa[estado] ?? 'neutro';
  }

  abrirAccion(s: Solicitud, estado: EstadoSolicitud): void {
    this.accionActual.set({ solicitud: s, estado });
    this.comentario.set(s.comentario_empresa ?? '');
    this.modalAbierto.set(true);
  }
  cerrarModal(): void { this.modalAbierto.set(false); this.accionActual.set(null); }

  confirmarAccion(): void {
    const acc = this.accionActual();
    if (!acc) return;
    this.solicitudService.cambiarEstado(acc.solicitud.id_solicitud, acc.estado, this.comentario()).subscribe({
      next: () => {
        this.toast.exito('Solicitud actualizada');
        this.solicitudes.update((lista) =>
          lista.map((x) => x.id_solicitud === acc.solicitud.id_solicitud
            ? { ...x, estado: acc.estado, comentario_empresa: this.comentario() }
            : x)
        );
        this.cerrarModal();
      },
      error: (err) => this.toast.error(err.message || 'No se pudo actualizar'),
    });
  }
}