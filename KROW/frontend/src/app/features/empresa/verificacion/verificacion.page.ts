import { Component, inject, signal, computed, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { forkJoin } from 'rxjs';
import { AuthService } from '../../../core/api/auth.service';
import { EmpresaService } from '../../../core/api/empresa.service';
import { VerificacionEmpresaService } from '../../../core/api/verificacionEmpresa.service';
import { ToastService } from '../../../shared/toast/toast.service';
import { Empresa, VerificacionEmpresa, TipoVerificacion } from '../../../core/models/Index';
import { BadgeComponent, VarianteBadge } from '../../../shared/badge/badge.component';
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
  private readonly auth = inject(AuthService);
  private readonly empresaService = inject(EmpresaService);
  private readonly verificacionService = inject(VerificacionEmpresaService);
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

  /** Estado a mostrar: verificada > solicitud pendiente > sin verificar */
  readonly estadoVisible = computed(() => {
    if (this.empresa()?.verificada) {
      return { texto: 'Verificada', variante: 'verificada' as VarianteBadge, conIcono: true };
    }
    const pendiente = this.verificaciones().find((v) => v.estado === 'PENDIENTE');
    if (pendiente) {
      return { texto: 'Solicitud en revisión', variante: 'estado-pendiente' as VarianteBadge, conIcono: false };
    }
    return { texto: 'Sin verificar', variante: 'neutro' as VarianteBadge, conIcono: false };
  });

  ngOnInit(): void {
    const idEmpresa = this.auth.idEmpresa();
    if (!idEmpresa) {
      this.cargando.set(false);
      return;
    }

    // Fase 6.5 sin N+1: 2 peticiones en paralelo; id_empresa sale del token
    // (antes se bajaba TODA la lista de empresas para encontrar la propia)
    forkJoin({
      empresa: this.empresaService.obtenerPorId(idEmpresa),
      verificaciones: this.verificacionService.listarPorEmpresa(idEmpresa),
    }).subscribe({
      next: ({ empresa, verificaciones }) => {
        this.empresa.set(empresa);
        this.verificaciones.set(verificaciones);
        this.cargando.set(false);
      },
      error: () => this.cargando.set(false),
    });
  }

  solicitar(tipo: TipoVerificacion): void {
    const idEmpresa = this.auth.idEmpresa();
    if (!idEmpresa) return;
    this.solicitando.set(true);
    // la empresa la deriva el backend del token
    this.verificacionService.solicitar(tipo).subscribe({
      next: () => {
        this.toast.exito('Solicitud de verificación enviada');
        this.solicitando.set(false);
        this.cargarVerificaciones(idEmpresa);
      },
      error: (err) => {
        this.solicitando.set(false);
        this.toast.error(err.message || 'No se pudo solicitar');
      },
    });
  }

  private cargarVerificaciones(empresaId: number): void {
    this.verificacionService.listarPorEmpresa(empresaId).subscribe({
      next: (v) => this.verificaciones.set(v),
      error: () => {},
    });
  }

  getVarianteEstado(estado: string): VarianteBadge {
    const mapa: Record<string, VarianteBadge> = {
      PENDIENTE: 'estado-pendiente', APROBADA: 'estado-aceptada', RECHAZADA: 'estado-rechazada',
    };
    return mapa[estado] ?? 'neutro';
  }
}