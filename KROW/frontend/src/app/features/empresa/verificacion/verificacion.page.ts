import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { EmpresaService } from '../../../core/api/empresa.service';
import { VerificacionEmpresaService } from '../../../core/api/verificacionEmpresa.service';
import { TokenStorageService } from '../../../core/token-storage.service';
import { ToastService } from '../../../shared/toast/toast.service';
import { Empresa, VerificacionEmpresa, TipoVerificacion } from '../../../core/models/Index';
import { BadgeComponent } from '../../../shared/badge/badge.component';
import { BotonComponent } from '../../../shared/boton/boton.component';
import { SpinnerComponent } from '../../../shared/spinner/spinner.component';
import { EmptyStateComponent } from '../../../shared/empty-state/empty-state.component';

@Component({
  selector: 'app-empresa-verificacion-page',
  standalone: true,
  imports: [CommonModule, BadgeComponent, BotonComponent, SpinnerComponent, EmptyStateComponent],
  templateUrl: './verificacion.page.html',
  styleUrl: './verificacion.page.css',
})
export class EmpresaVerificacionPage implements OnInit {
  private readonly empresaService = inject(EmpresaService);
  private readonly verificacionService = inject(VerificacionEmpresaService);
  private readonly tokenStorage = inject(TokenStorageService);
  private readonly toast = inject(ToastService);

  readonly empresa = signal<Empresa | null>(null);
  readonly verificaciones = signal<VerificacionEmpresa[]>([]);
  readonly cargando = signal(true);
  readonly solicitando = signal(false);

  readonly planes: { tipo: TipoVerificacion; titulo: string; descripcion: string }[] = [
    { tipo: 'PLATA', titulo: 'Plata', descripcion: 'Verificación básica de datos de la empresa.' },
    { tipo: 'PLATINO', titulo: 'Platino', descripcion: 'Verificación de datos + revisión de historial.' },
    { tipo: 'DIAMANTE', titulo: 'Diamante', descripcion: 'Verificación completa con auditoría.' },
  ];

  ngOnInit(): void {
    const id = this.tokenStorage.obtenerIdCuenta();
    if (!id) return;
    this.empresaService.listar().subscribe({
      next: (emps) => {
        const mia = emps.find((e) => e.cuenta_id === id);
        if (!mia) { this.cargando.set(false); return; }
        this.empresa.set(mia);
        this.cargarVerificaciones(mia.id_empresa);
      },
      error: () => this.cargando.set(false),
    });
  }

  private cargarVerificaciones(empresaId: number): void {
    this.verificacionService.listarPorEmpresa(empresaId).subscribe({
      next: (v) => { this.verificaciones.set(v); this.cargando.set(false); },
      error: () => this.cargando.set(false),
    });
  }

  solicitar(tipo: TipoVerificacion): void {
    const e = this.empresa();
    if (!e) return;
    this.solicitando.set(true);
    // la empresa la deriva el backend del token
    this.verificacionService.solicitar(tipo).subscribe({
      next: () => {
        this.toast.exito('Solicitud de verificación enviada');
        this.solicitando.set(false);
        this.cargarVerificaciones(e.id_empresa);
      },
      error: (err) => {
        this.solicitando.set(false);
        this.toast.error(err.message || 'No se pudo solicitar');
      },
    });
  }

  getVarianteEstado(estado: string): any {
    const mapa: Record<string, string> = {
      PENDIENTE: 'estado-pendiente', APROBADA: 'estado-aceptada', RECHAZADA: 'estado-rechazada',
    };
    return mapa[estado] ?? 'neutro';
  }
}