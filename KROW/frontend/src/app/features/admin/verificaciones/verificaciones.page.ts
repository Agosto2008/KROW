import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { VerificacionEmpresaService, VerificacionConEmpresa } from '../../../core/api/verificacionEmpresa.service';
import { ToastService } from '../../../shared/toast/toast.service';
import { EstadoVerificacion } from '../../../core/models/Index';
import { BadgeComponent, VarianteBadge } from '../../../shared/badge/badge.component';
import { BotonComponent } from '../../../shared/boton/boton.component';
import { SpinnerComponent } from '../../../shared/spinner/spinner.component';
import { EmptyStateComponent } from '../../../shared/empty-state/empty-state.component';
import { ModalComponent } from '../../../shared/modal/modal.component';
import { CampoTextareaComponent } from '../../../shared/campo-textarea/campo-textarea.component';
 
@Component({
  selector: 'app-admin-verificaciones-page',
  standalone: true,
  imports: [CommonModule, FormsModule, BadgeComponent, BotonComponent, SpinnerComponent, EmptyStateComponent, ModalComponent, CampoTextareaComponent],
  templateUrl: './verificaciones.page.html',
  styleUrl: './verificaciones.page.css',
})
export class AdminVerificacionesPage implements OnInit {
  private readonly verificacionService = inject(VerificacionEmpresaService);
  private readonly toast = inject(ToastService);
 
  /** Cola del admin con el nombre de la empresa ya resuelto (1 query) */
  readonly verificaciones = signal<VerificacionConEmpresa[]>([]);
  readonly cargando = signal(true);
  readonly filtro = signal<EstadoVerificacion | 'TODAS'>('PENDIENTE');
  readonly modalAbierto = signal(false);
  readonly seleccionada = signal<VerificacionConEmpresa | null>(null);
  readonly accion = signal<Extract<EstadoVerificacion, 'APROBADA' | 'RECHAZADA'>>('APROBADA');
 
  observacion = '';
 
  ngOnInit(): void {
    this.cargar();
  }
 
  private cargar(): void {
    const estado = this.filtro() === 'TODAS' ? '' : (this.filtro() as EstadoVerificacion);
    this.verificacionService.listarTodas(estado).subscribe({
      next: (vs) => { this.verificaciones.set(vs); this.cargando.set(false); },
      error: () => this.cargando.set(false),
    });
  }
 
  get filtradas(): VerificacionConEmpresa[] {
    return this.verificaciones();
  }
 
  setFiltro(f: EstadoVerificacion | 'TODAS'): void {
    this.filtro.set(f);
    this.cargando.set(true);
    this.cargar();
  }
 
  abrirResolver(v: VerificacionConEmpresa, accion: 'APROBADA' | 'RECHAZADA'): void {
    this.seleccionada.set(v);
    this.accion.set(accion);
    this.observacion = '';
    this.modalAbierto.set(true);
  }
  cerrarModal(): void { this.modalAbierto.set(false); this.seleccionada.set(null); }
 
  readonly confirmando = signal(false);
 
  confirmar(): void {
    const v = this.seleccionada();
    if (!v || this.confirmando()) return;
    this.confirmando.set(true);
    // el administrador lo toma el backend del token
    this.verificacionService.resolver(v.id_verificacion, this.accion(), this.observacion).subscribe({
      next: () => {
        this.confirmando.set(false);
        this.toast.exito(`Verificación ${this.accion().toLowerCase()}`);
        this.verificaciones.update((lista) =>
          lista.map((x) => x.id_verificacion === v.id_verificacion
            ? { ...x, estado: this.accion(), observacion: this.observacion }
            : x)
        );
        this.cerrarModal();
      },
      error: (err) => {
        this.confirmando.set(false);
        this.toast.error(err.message || 'No se pudo resolver');
      },
    });
  }
 
  getVarianteEstado(estado: string): VarianteBadge {
    const mapa: Record<string, VarianteBadge> = {
      PENDIENTE: 'estado-pendiente',
      APROBADA: 'estado-aceptada',
      RECHAZADA: 'estado-rechazada',
      ACTIVA: 'estado-activa',
      PAUSADA: 'estado-pausada',
      CERRADA: 'estado-cerrada',
      VENCIDA: 'estado-vencida',
      PROGRAMADA: 'estado-pendiente',
      REPROGRAMADA: 'estado-revision',
      REALIZADA: 'estado-aceptada',
      CANCELADA: 'estado-cancelada',
    };
    return mapa[estado] ?? 'neutro';
  }
}
 
 