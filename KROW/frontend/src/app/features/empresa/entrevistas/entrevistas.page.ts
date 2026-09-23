import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthService } from '../../../core/api/auth.service';
import { SolicitudService } from '../../../core/api/solicitud.service';
import { EntrevistaService } from '../../../core/api/entrevista.service';
import { ToastService } from '../../../shared/toast/toast.service';
import { EntrevistaConCandidato, SolicitudConCandidato, EstadoEntrevista } from '../../../core/models/Index';
import { BadgeComponent, VarianteBadge } from '../../../shared/badge/badge.component';
import { BotonComponent } from '../../../shared/boton/boton.component';
import { ModalComponent } from '../../../shared/modal/modal.component';
import { CampoInputComponent } from '../../../shared/campo-input/campo-input.component';
import { CampoSelectComponent, OpcionSelect } from '../../../shared/campo-select/campo-select.component';
import { CampoTextareaComponent } from '../../../shared/campo-textarea/campo-textarea.component';
import { EmptyStateComponent } from '../../../shared/empty-state/empty-state.component';
import { SpinnerComponent } from '../../../shared/spinner/spinner.component';

@Component({
  selector: 'app-empresa-entrevistas-page',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, BadgeComponent, BotonComponent, ModalComponent, CampoInputComponent, CampoSelectComponent, CampoTextareaComponent, EmptyStateComponent, SpinnerComponent],
  templateUrl: './entrevistas.page.html',
  styleUrl: './entrevistas.page.css',
})
export class EmpresaEntrevistasPage implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly auth = inject(AuthService);
  private readonly solicitudService = inject(SolicitudService);
  private readonly entrevistaService = inject(EntrevistaService);
  private readonly toast = inject(ToastService);

  /** Entrevistas de MIS ofertas con candidato resuelto (1 query) */
  readonly entrevistas = signal<EntrevistaConCandidato[]>([]);
  readonly solicitudesAceptadas = signal<SolicitudConCandidato[]>([]);
  readonly cargando = signal(true);
  readonly modalAbierto = signal(false);

  readonly modalidades: OpcionSelect[] = [
    { valor: 'PRESENCIAL', etiqueta: 'Presencial' },
    { valor: 'VIRTUAL', etiqueta: 'Virtual' },
    { valor: 'TELEFONICA', etiqueta: 'Telefónica' },
  ];

  readonly form = this.fb.nonNullable.group({
    solicitud_id: [0, [Validators.required, Validators.min(1)]],
    fecha: ['', Validators.required],
    hora: ['', Validators.required],
    modalidad: ['VIRTUAL', Validators.required],
    ubicacion: [''],
    enlace: [''],
    observaciones: [''],
  });

  ngOnInit(): void {
    const idEmpresa = this.auth.idEmpresa();
    if (!idEmpresa) {
      this.cargando.set(false);
      return;
    }

    // 2 queries en total (antes: 1 por propuesta + 1 por solicitud + 1 por entrevista)
    this.entrevistaService.listarPorEmpresa(idEmpresa).subscribe({
      next: (ee) => this.entrevistas.set(ee),
      error: () => {},
    });

    this.solicitudService.listarPorEmpresa(idEmpresa).subscribe({
      next: (sols) => {
        this.solicitudesAceptadas.set(sols.filter((s) => s.estado === 'ACEPTADA'));
        this.cargando.set(false);
      },
      error: () => this.cargando.set(false),
    });
  }

  abrirModal(): void {
    this.form.reset({ solicitud_id: 0, fecha: '', hora: '', modalidad: 'VIRTUAL', ubicacion: '', enlace: '', observaciones: '' });
    this.modalAbierto.set(true);
  }
  cerrarModal(): void { this.modalAbierto.set(false); }

  programar(): void {
    if (this.form.invalid) return;
    const datos = this.form.getRawValue();
    this.entrevistaService.programar({
      solicitud_id: Number(datos.solicitud_id),
      fecha: datos.fecha,
      hora: datos.hora,
      modalidad: datos.modalidad as never,
      ubicacion: datos.ubicacion || null,
      enlace: datos.enlace || null,
      observaciones: datos.observaciones || null,
    }).subscribe({
      next: () => {
        this.toast.exito('Entrevista programada');
        this.cerrarModal();
        this.recargar();
      },
      error: (err) => this.toast.error(err.message || 'No se pudo programar'),
    });
  }

  private recargar(): void {
    const idEmpresa = this.auth.idEmpresa();
    if (!idEmpresa) return;
    this.entrevistaService.listarPorEmpresa(idEmpresa).subscribe({
      next: (ee) => this.entrevistas.set(ee),
      error: () => {},
    });
  }

  cambiarEstado(id: number, estado: EstadoEntrevista): void {
    this.entrevistaService.cambiarEstado(id, estado).subscribe({
      next: () => {
        this.entrevistas.update((lista) => lista.map((e) => e.id_entrevista === id ? { ...e, estado } : e));
        this.toast.exito('Estado actualizado');
      },
      error: () => this.toast.error('No se pudo actualizar'),
    });
  }

  getVarianteEstado(estado: string): VarianteBadge {
    const mapa: Record<string, VarianteBadge> = {
      PROGRAMADA: 'estado-pendiente', REPROGRAMADA: 'estado-revision',
      REALIZADA: 'estado-aceptada', CANCELADA: 'estado-rechazada',
      PENDIENTE: 'estado-pendiente', EN_REVISION: 'estado-revision',
      ACEPTADA: 'estado-aceptada', RECHAZADA: 'estado-rechazada',
    };
    return mapa[estado] ?? 'neutro';
  }

  nombreCandidato(e: EntrevistaConCandidato): string {
    return [e.primer_nombre, e.segundo_nombre, e.primer_apellido, e.segundo_apellido]
      .filter(Boolean).join(' ') || 'Candidato';
  }

  getOpcionesSolicitudes(): OpcionSelect[] {
    return this.solicitudesAceptadas().map((s) => ({
      valor: s.id_solicitud,
      etiqueta: `#${s.id_solicitud} → ${s.propuesta_nombre}`,
    }));
  }
}
