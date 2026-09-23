import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { EmpresaService } from '../../../core/api/empresa.service';
import { PropuestaService } from '../../../core/api/propuesta.service';
import { ReporteService } from '../../../core/api/reporte.service';
import { VerificacionEmpresaService } from '../../../core/api/verificacionEmpresa.service';
import { Empresa, Propuesta, Reporte, VerificacionEmpresa } from '../../../core/models/Index';
import { BadgeComponent } from '../../../shared/badge/badge.component';
import { BotonComponent } from '../../../shared/boton/boton.component';
import { SpinnerComponent } from '../../../shared/spinner/spinner.component';
import { EmptyStateComponent } from '../../../shared/empty-state/empty-state.component';

@Component({
  selector: 'app-admin-panel-page',
  standalone: true,
  imports: [CommonModule, RouterLink, BadgeComponent, BotonComponent, SpinnerComponent, EmptyStateComponent],
  templateUrl: './panel.page.html',
  styleUrl: './panel.page.css',
})
export class AdminPanelPage implements OnInit {
  private readonly empresaService = inject(EmpresaService);
  private readonly propuestaService = inject(PropuestaService);
  private readonly reporteService = inject(ReporteService);
  private readonly verificacionService = inject(VerificacionEmpresaService);

  readonly empresas = signal<Empresa[]>([]);
  readonly propuestas = signal<Propuesta[]>([]);
  readonly reportes = signal<Reporte[]>([]);
  readonly verificacionesPendientes = signal<VerificacionEmpresa[]>([]);
  readonly cargando = signal(true);

  readonly tabActiva = signal<'pendientes' | 'verificadas' | 'stats'>('pendientes');

  ngOnInit(): void {
    this.cargarTodo();
  }

  private cargarTodo(): void {
    let pendientes = 3;

    this.empresaService.listar().subscribe({
      next: (emps) => { this.empresas.set(emps); if (--pendientes === 0) this.cargando.set(false); },
      error: () => { if (--pendientes === 0) this.cargando.set(false); },
    });

    this.propuestaService.buscar({ por_pagina: 50 }).subscribe({
      next: (res) => { this.propuestas.set(res.datos); if (--pendientes === 0) this.cargando.set(false); },
      error: () => { if (--pendientes === 0) this.cargando.set(false); },
    });

    this.reporteService.listar().subscribe({
      next: (reps) => { this.reportes.set(reps); if (--pendientes === 0) this.cargando.set(false); },
      error: () => { if (--pendientes === 0) this.cargando.set(false); },
    });

    // Verificaciones pendientes: cargar por cada empresa
    setTimeout(() => {
      this.empresas().forEach((e) => {
        this.verificacionService.listarPorEmpresa(e.id_empresa).subscribe({
          next: (vs) => {
            const pend = vs.filter((v) => v.estado === 'PENDIENTE');
            this.verificacionesPendientes.update((lista) => [...lista, ...pend]);
          },
          error: () => {},
        });
      });
    }, 500);
  }

  get totalEmpresas(): number { return this.empresas().length; }
  get totalVerificadas(): number { return this.empresas().filter((e) => e.verificada).length; }
  get totalPendientes(): number { return this.verificacionesPendientes().length; }
  get totalPropuestas(): number { return this.propuestas().filter((p) => p.estado === 'ACTIVA').length; }
  get totalReportes(): number { return this.reportes().length; }

  setTab(t: 'pendientes' | 'verificadas' | 'stats'): void { this.tabActiva.set(t); }

  getEmpresaNombre(empresaId: number): string {
    return this.empresas().find((e) => e.id_empresa === empresaId)?.nombre ?? 'Empresa';
  }
}