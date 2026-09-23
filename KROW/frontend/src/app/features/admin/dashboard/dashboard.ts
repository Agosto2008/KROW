import { Component, inject, signal, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { EmpresaService } from '../../../core/services/empresa.service';
import { PropuestaService } from '../../../core/services/propuesta.service';
import { ReporteService } from '../../../core/services/reporte.service';

@Component({
    selector: 'app-dashboard',
    imports: [RouterLink],
    template: `
    <div class="head">
      <h1>Panel de administración</h1>
      <p class="sub">Resumen general de la plataforma</p>
    </div>

    <div class="grid-stats">
      <a class="card stat" routerLink="/admin/verificaciones">
        <span class="stat-label">Empresas registradas</span>
        <span class="stat-value">{{ totalEmpresas() }}</span>
        <span class="stat-hint">Gestionar verificaciones →</span>
      </a>

      <a class="card stat" routerLink="/propuestas">
        <span class="stat-label">Propuestas publicadas</span>
        <span class="stat-value">{{ totalPropuestas() }}</span>
        <span class="stat-hint">Ver todas →</span>
      </a>

      <a class="card stat" routerLink="/admin/reportes">
        <span class="stat-label">Reportes pendientes</span>
        <span class="stat-value">{{ reportesPendientes() }}</span>
        <span class="stat-hint">Revisar reportes →</span>
      </a>
    </div>

    <div class="card acciones">
      <h2>Acciones rápidas</h2>
      <div class="acciones-grid">
        <a class="accion" routerLink="/admin/verificaciones">
          <strong>Aprobar verificaciones</strong>
          <span>Revisa las solicitudes de verificación de empresas</span>
        </a>
        <a class="accion" routerLink="/admin/reportes">
          <strong>Atender reportes</strong>
          <span>Revisa y resuelve reportes de usuarios</span>
        </a>
      </div>
    </div>
  `,
    styles: [`
    .head { margin-bottom: 24px; }
    h1 { margin: 0 0 4px; }
    .sub { color: #64748b; margin: 0; font-size: 14px; }
    .grid-stats { display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 16px; margin-bottom: 24px; }
    .stat { display: flex; flex-direction: column; gap: 6px; text-decoration: none; color: inherit; transition: transform .15s, box-shadow .15s; }
    .stat:hover { transform: translateY(-2px); box-shadow: 0 8px 20px rgba(0,0,0,.06); }
    .stat-label { color: #64748b; font-size: 13px; font-weight: 500; }
    .stat-value { font-size: 32px; font-weight: 800; color: #0f172a; }
    .stat-hint { font-size: 12px; color: #4f46e5; font-weight: 600; }
    .acciones h2 { margin: 0 0 16px; font-size: 16px; }
    .acciones-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
    .accion { display: flex; flex-direction: column; gap: 4px; padding: 16px; background: #f8fafc; border-radius: 10px; text-decoration: none; color: inherit; border: 1px solid #e2e8f0; }
    .accion:hover { border-color: #4f46e5; background: #eef2ff; }
    .accion strong { color: #0f172a; font-size: 14px; }
    .accion span { color: #64748b; font-size: 12px; }
  `]
})
export class Dashboard implements OnInit {
    private empresaSvc = inject(EmpresaService);
    private propuestaSvc = inject(PropuestaService);
    private reporteSvc = inject(ReporteService);

    totalEmpresas = signal(0);
    totalPropuestas = signal(0);
    reportesPendientes = signal(0);

    ngOnInit() {
        this.empresaSvc.listar().subscribe(e => this.totalEmpresas.set(e.length));
        this.propuestaSvc.listar().subscribe(p => this.totalPropuestas.set(p.length));
        this.reporteSvc.listar('PENDIENTE').subscribe(r => this.reportesPendientes.set(r.length));
    }
}