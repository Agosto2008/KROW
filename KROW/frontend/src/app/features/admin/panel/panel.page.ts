import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { forkJoin } from 'rxjs';
import { EmpresaService } from '../../../core/api/empresa.service';
import { PropuestaService } from '../../../core/api/propuesta.service';
import { ReporteService } from '../../../core/api/reporte.service';
import { VerificacionEmpresaService, VerificacionConEmpresa } from '../../../core/api/verificacionEmpresa.service';
import { Empresa, Propuesta, Reporte } from '../../../core/models/Index';
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
  /** Cola global de pendientes: 1 petición con la empresa ya resuelta (Fase 2.7) */
  readonly verificacionesPendientes = signal<VerificacionConEmpresa[]>([]);
  readonly cargando = signal(true);

  readonly tabActiva = signal<'pendientes' | 'verificadas' | 'stats'>('pendientes');

  ngOnInit(): void {
    this.cargarTodo();
  }

  /**
   * Fase 7.1: 4 peticiones EN PARALELO (forkJoin = Promise.all de RxJS).
   * Sin setTimeout(500) y sin el N+1 de pedir verificaciones empresa por
   * empresa: la cola global `?estado=PENDIENTE` trae todo en 1 query.
   */
  private cargarTodo(): void {
    forkJoin({
      empresas: this.empresaService.listar(),
      // estado: undefined anula el default 'ACTIVA' → total REAL de ofertas
      propuestas: this.propuestaService.buscar({ por_pagina: 50, estado: undefined }),
      reportes: this.reporteService.listar(),
      pendientes: this.verificacionService.listarTodas('PENDIENTE'),
    }).subscribe({
      next: ({ empresas, propuestas, reportes, pendientes }) => {
        this.empresas.set(empresas);
        this.propuestas.set(propuestas.datos);
        this.reportes.set(reportes);
        this.verificacionesPendientes.set(pendientes);
        this.cargando.set(false);
      },
      error: () => this.cargando.set(false),
    });
  }

  get totalEmpresas(): number { return this.empresas().length; }
  get totalVerificadas(): number { return this.empresas().filter((e) => e.verificada).length; }
  get totalPendientes(): number { return this.verificacionesPendientes().length; }
  get totalPropuestas(): number { return this.propuestas().filter((p) => p.estado === 'ACTIVA').length; }
  get totalReportes(): number { return this.reportes().length; }

  setTab(t: 'pendientes' | 'verificadas' | 'stats'): void { this.tabActiva.set(t); }
}
