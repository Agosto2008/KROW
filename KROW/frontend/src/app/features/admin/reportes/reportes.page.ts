import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ReporteService } from '../../../core/api/reporte.service';
import { ToastService } from '../../../shared/toast/toast.service';
import { Reporte, EstadoReporte } from '../../../core/models/Index';
import { BadgeComponent, VarianteBadge } from '../../../shared/badge/badge.component';
import { BotonComponent } from '../../../shared/boton/boton.component';
import { SpinnerComponent } from '../../../shared/spinner/spinner.component';
import { EmptyStateComponent } from '../../../shared/empty-state/empty-state.component';

@Component({
  selector: 'app-admin-reportes-page',
  standalone: true,
  imports: [CommonModule, FormsModule, BadgeComponent, BotonComponent, SpinnerComponent, EmptyStateComponent],
  templateUrl: './reportes.page.html',
  styleUrl: './reportes.page.css',
})
export class AdminReportesPage implements OnInit {
  private readonly reporteService = inject(ReporteService);
  private readonly toast = inject(ToastService);

  readonly reportes = signal<Reporte[]>([]);
  readonly cargando = signal(true);
  readonly filtro = signal<EstadoReporte | 'TODOS'>('TODOS');

  ngOnInit(): void { this.cargar(); }

  private cargar(): void {
    this.reporteService.listar().subscribe({
      next: (r) => { this.reportes.set(r); this.cargando.set(false); },
      error: () => this.cargando.set(false),
    });
  }

  get filtradas(): Reporte[] {
    if (this.filtro() === 'TODOS') return this.reportes();
    return this.reportes().filter((r) => r.estado === this.filtro());
  }

  setFiltro(f: EstadoReporte | 'TODOS'): void { this.filtro.set(f); }

  cambiarEstado(r: Reporte, estado: EstadoReporte): void {
    this.reporteService.cambiarEstado(r.id_reporte, estado).subscribe({
      next: () => {
        this.reportes.update((lista) => lista.map((x) => x.id_reporte === r.id_reporte ? { ...x, estado } : x));
        this.toast.exito('Estado actualizado');
      },
      error: () => this.toast.error('No se pudo actualizar'),
    });
  }

  getVarianteEstado(estado: string): VarianteBadge {
    const mapa: Record<string, VarianteBadge> = {
      PENDIENTE: 'estado-pendiente', EN_REVISION: 'estado-revision',
      RESUELTO: 'estado-aceptada', DESCARTADO: 'estado-cancelada',
    };
    return mapa[estado] ?? 'neutro';
  }
}