import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { EmpresaService } from '../../../services/empresa.service';
import { PropuestaService } from '../../../services/propuesta.service';
import { SolicitudService } from '../../../services/solicitud.service';
import { EntrevistaService } from '../../../services/entrevista.service';
import { TokenStorageService } from '../../../core/token-storage.service';
import { ToastService } from '../../../shader/toast/toast.service';
import { Entrevista, EstadoEntrevista, Solicitud, Propuesta } from '../../../models/Index';
import { BadgeComponent } from '../../../shader/badge/badge.component';
import { BotonComponent } from '../../../shader/boton/boton.component';
import { ModalComponent } from '../../../shader/modal/modal.component';
import { CampoInputComponent } from '../../../shader/campo-input/campo-input.component';
import { CampoSelectComponent, OpcionSelect } from '../../../shader/campo-select/campo-select.component';
import { CampoTextareaComponent } from '../../../shader/campo-textarea/campo-textarea.component';
import { EmptyStateComponent } from '../../../shader/empty-state/empty-state.component';
import { SpinnerComponent } from '../../../shader/spinner/spinner.component';

interface EntrevistaConSolicitud extends Entrevista {
  _solicitud?: Solicitud;
}

@Component({
  selector: 'app-empresa-entrevistas-page',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, BadgeComponent, BotonComponent, ModalComponent, CampoInputComponent, CampoSelectComponent, CampoTextareaComponent, EmptyStateComponent, SpinnerComponent],
  templateUrl: './entrevistas.page.html',
  styleUrl: './entrevistas.page.css',
})
export class EmpresaEntrevistasPage implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly empresaService = inject(EmpresaService);
  private readonly propuestaService = inject(PropuestaService);
  private readonly solicitudService = inject(SolicitudService);
  private readonly entrevistaService = inject(EntrevistaService);
  private readonly tokenStorage = inject(TokenStorageService);
  private readonly toast = inject(ToastService);

  readonly entrevistas = signal<EntrevistaConSolicitud[]>([]);
  readonly solicitudesAceptadas = signal<Solicitud[]>([]);
  readonly propuestasMap = signal<Record<number, Propuesta>>({});
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
    const id = this.tokenStorage.obtenerIdCuenta();
    if (!id) return;
    this.empresaService.listar().subscribe({
      next: (emps) => {
        const mia = emps.find((e) => e.cuenta_id === id);
        if (!mia) { this.cargando.set(false); return; }
        this.cargarTodo(mia.id_empresa);
      },
      error: () => this.cargando.set(false),
    });
  }

  private cargarTodo(empresaId: number): void {
    this.propuestaService.listar({ empresa_id: empresaId }).subscribe({
      next: (props) => {
        const map: Record<number, Propuesta> = {};
        props.forEach((p) => (map[p.id_propuesta] = p));
        this.propuestasMap.set(map);

        let pendientes = props.length;
        if (pendientes === 0) { this.cargando.set(false); return; }

        props.forEach((p) => {
          this.solicitudService.listarPorPropuesta(p.id_propuesta).subscribe({
            next: (ss) => {
              const aceptadas = ss.filter((s) => s.estado === 'ACEPTADA');
              this.solicitudesAceptadas.update((lista) => [...lista, ...aceptadas]);
              aceptadas.forEach((s) => this.cargarEntrevistas(s));
            },
            error: () => {},
            complete: () => { if (--pendientes === 0) this.cargando.set(false); },
          });
        });
      },
      error: () => this.cargando.set(false),
    });
  }

  private cargarEntrevistas(s: Solicitud): void {
    this.entrevistaService.listarPorSolicitud(s.id_solicitud).subscribe({
      next: (ee) => this.entrevistas.update((lista) => [...lista, ...ee.map((e) => ({ ...e, _solicitud: s }))]),
      error: () => {},
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
      modalidad: datos.modalidad as any,
      ubicacion: datos.ubicacion || null,
      enlace: datos.enlace || null,
      observaciones: datos.observaciones || null,
    }).subscribe({
      next: () => {
        this.toast.exito('Entrevista programada');
        this.cerrarModal();
        const s = this.solicitudesAceptadas().find((x) => x.id_solicitud === Number(datos.solicitud_id));
        if (s) this.cargarEntrevistas(s);
      },
      error: (err) => this.toast.error(err.message || 'No se pudo programar'),
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

  getVarianteEstado(estado: string): any {
    const mapa: Record<string, string> = {
      PROGRAMADA: 'estado-pendiente', REPROGRAMADA: 'estado-revision',
      REALIZADA: 'estado-aceptada', CANCELADA: 'estado-cancelada',
    };
    return mapa[estado] ?? 'neutro';
  }

  getOpcionesSolicitudes(): OpcionSelect[] {
    return this.solicitudesAceptadas().map((s) => ({
      valor: s.id_solicitud,
      etiqueta: `#${s.id_solicitud} — ${this.propuestasMap()[s.propuesta_id]?.nombre ?? 'Propuesta'}`,
    }));
  }
}