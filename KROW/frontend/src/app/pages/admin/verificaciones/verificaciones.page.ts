import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { VerificacionEmpresaService } from '../../../services/verificacionEmpresa.service';
import { EmpresaService } from '../../../services/empresa.service';
import { ToastService } from '../../../shader/toast/toast.service';
import { VerificacionEmpresa, Empresa, EstadoVerificacion } from '../../../models/Index';
import { BadgeComponent } from '../../../shader/badge/badge.component';
import { BotonComponent } from '../../../shader/boton/boton.component';
import { SpinnerComponent } from '../../../shader/spinner/spinner.component';
import { EmptyStateComponent } from '../../../shader/empty-state/empty-state.component';
import { ModalComponent } from '../../../shader/modal/modal.component';
import { CampoTextareaComponent } from '../../../shader/campo-textarea/campo-textarea.component';
import { CampoInputComponent } from '../../../shader/campo-input/campo-input.component';

interface VerificacionConEmpresa extends VerificacionEmpresa {
  _empresa?: Empresa;
}

@Component({
  selector: 'app-admin-verificaciones-page',
  standalone: true,
  imports: [CommonModule, FormsModule, BadgeComponent, BotonComponent, SpinnerComponent, EmptyStateComponent, ModalComponent, CampoTextareaComponent, CampoInputComponent],
  templateUrl: './verificaciones.page.html',
  styleUrl: './verificaciones.page.css',
})
export class AdminVerificacionesPage implements OnInit {
  private readonly verificacionService = inject(VerificacionEmpresaService);
  private readonly empresaService = inject(EmpresaService);
  private readonly toast = inject(ToastService);

  readonly verificaciones = signal<VerificacionConEmpresa[]>([]);
  readonly cargando = signal(true);
  readonly filtro = signal<EstadoVerificacion | 'TODAS'>('PENDIENTE');
  readonly modalAbierto = signal(false);
  readonly seleccionada = signal<VerificacionConEmpresa | null>(null);
  readonly accion = signal<EstadoVerificacion>('APROBADA');

  administrador = '';
  observacion = '';

  ngOnInit(): void {
    this.cargarTodo();
  }

  private cargarTodo(): void {
    this.empresaService.listar().subscribe({
      next: (empresas) => {
        if (empresas.length === 0) { this.cargando.set(false); return; }
        let pendientes = empresas.length;
        empresas.forEach((e) => {
          this.verificacionService.listarPorEmpresa(e.id_empresa).subscribe({
            next: (vs) => this.verificaciones.update((lista) => [...lista, ...vs.map((v) => ({ ...v, _empresa: e }))]),
            error: () => {},
            complete: () => { if (--pendientes === 0) this.cargando.set(false); },
          });
        });
      },
      error: () => this.cargando.set(false),
    });
  }

  get filtradas(): VerificacionConEmpresa[] {
    if (this.filtro() === 'TODAS') return this.verificaciones();
    return this.verificaciones().filter((v) => v.estado === this.filtro());
  }

  setFiltro(f: EstadoVerificacion | 'TODAS'): void { this.filtro.set(f); }

  abrirResolver(v: VerificacionConEmpresa, accion: EstadoVerificacion): void {
    this.seleccionada.set(v);
    this.accion.set(accion);
    this.observacion = '';
    this.administrador = '';
    this.modalAbierto.set(true);
  }
  cerrarModal(): void { this.modalAbierto.set(false); this.seleccionada.set(null); }

  confirmar(): void {
    const v = this.seleccionada();
    if (!v) return;
    const adm = this.administrador.trim() || 'Administrador';
    this.verificacionService.resolver(v.id_verificacion, v.empresa_id, this.accion(), adm, this.observacion).subscribe({
      next: () => {
        this.toast.exito(`Verificación ${this.accion().toLowerCase()}`);
        this.verificaciones.update((lista) =>
          lista.map((x) => x.id_verificacion === v.id_verificacion
            ? { ...x, estado: this.accion(), observacion: this.observacion, administrador: adm }
            : x)
        );
        this.cerrarModal();
      },
      error: (err) => this.toast.error(err.message || 'No se pudo resolver'),
    });
  }

  getVarianteEstado(estado: string): any {
    const mapa: Record<string, string> = {
      PENDIENTE: 'estado-pendiente', APROBADA: 'estado-aceptada', RECHAZADA: 'estado-rechazada',
    };
    return mapa[estado] ?? 'neutro';
  }

  nombreEmpresa(v: VerificacionConEmpresa): string {
    return v._empresa?.nombre ?? 'Empresa';
  }
}