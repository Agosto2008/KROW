import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { EmpresaService } from '../../../core/api/empresa.service';
import { AuthService } from '../../../core/api/auth.service';
import { ReporteService } from '../../../core/api/reporte.service';
import { ToastService } from '../../../shared/toast/toast.service';
import {
  EmpresaConPropuestas,
  MotivoReporte,
  MOTIVOS_REPORTE,
} from '../../../core/models/Index';
import { PropuestaCardComponent } from '../../../shared/propuesta-card/propuesta-card.component';
import { AvatarEmpresaComponent } from '../../../shared/avatar-empresa/avatar-empresa.component';
import { BadgeComponent } from '../../../shared/badge/badge.component';
import { EmptyStateComponent } from '../../../shared/empty-state/empty-state.component';
import { SpinnerComponent } from '../../../shared/spinner/spinner.component';
import { ModalComponent } from '../../../shared/modal/modal.component';
import { BotonComponent } from '../../../shared/boton/boton.component';
import { CampoSelectComponent, OpcionSelect } from '../../../shared/campo-select/campo-select.component';
import { CampoTextareaComponent } from '../../../shared/campo-textarea/campo-textarea.component';

/**
 * Perfil público de una empresa + sus ofertas activas.
 * 1 sola petición: GET /empresas/:id/con-propuestas.
 * Desde aquí también se reporta la empresa (Fase 5.8).
 */
@Component({
  selector: 'app-empresa-detalle-page',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterLink,
    PropuestaCardComponent,
    AvatarEmpresaComponent,
    BadgeComponent,
    EmptyStateComponent,
    SpinnerComponent,
    ModalComponent,
    BotonComponent,
    CampoSelectComponent,
    CampoTextareaComponent,
  ],
  templateUrl: './empresa-detalle.page.html',
  styleUrls: ['./empresa-detalle.page.css', '../../../shared/estilos/pagina.css'],
})
export class EmpresaDetallePage implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly empresaService = inject(EmpresaService);
  private readonly auth = inject(AuthService);
  private readonly reporteService = inject(ReporteService);
  private readonly toast = inject(ToastService);

  readonly empresa = signal<EmpresaConPropuestas | null>(null);
  readonly cargando = signal(true);

  // modal de reporte de empresa (Fase 5.8)
  readonly modalReporteAbierto = signal(false);
  readonly enviandoReporte = signal(false);
  readonly motivosReporte: OpcionSelect[] = MOTIVOS_REPORTE;
  motivoReporte: MotivoReporte = 'EMPRESA_NO_VERIFICADA';
  detalleReporte = '';

  /** Nivel de verificación visible solo si la empresa está verificada */
  nivelVerificacion(): string | null {
    const e = this.empresa();
    if (!e?.verificada || !e.verificacion) return null;
    return e.verificacion.tipo_verificacion;
  }

  varianteNivel(): 'verificada' | 'neutro' {
    return this.empresa()?.verificacion?.estado === 'APROBADA' ? 'verificada' : 'neutro';
  }

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    if (!id) {
      this.router.navigate(['/empresas']);
      return;
    }

    this.empresaService.obtenerConPropuestas(id).subscribe({
      next: (empresa) => {
        this.empresa.set(empresa);
        this.cargando.set(false);
      },
      error: () => {
        this.cargando.set(false);
        this.router.navigate(['/empresas']);
      },
    });
  }

  // ============================================================
  // Reportar empresa (Fase 5.8 / 2.14)
  // ============================================================

  abrirReporte(): void {
    if (this.auth.rol() !== 'USUARIO') {
      this.toast.info('Inicia sesion como candidato para reportar empresas');
      return;
    }
    this.motivoReporte = 'EMPRESA_NO_VERIFICADA';
    this.detalleReporte = '';
    this.modalReporteAbierto.set(true);
  }

  cerrarReporte(): void {
    if (this.enviandoReporte()) return;
    this.modalReporteAbierto.set(false);
  }

  enviarReporte(): void {
    const e = this.empresa();
    if (!e) return;

    const detalle = this.detalleReporte.trim();
    if (!detalle) {
      this.toast.error('Explica brevemente el motivo del reporte');
      return;
    }

    this.enviandoReporte.set(true);
    // el usuario_id lo deriva el backend del token
    this.reporteService.crear({
      motivo: this.motivoReporte,
      descripcion: detalle,
      empresa_id: e.id_empresa,
    }).subscribe({
      next: () => {
        this.enviandoReporte.set(false);
        this.modalReporteAbierto.set(false);
        this.toast.exito('Reporte enviado. Gracias por cuidar la comunidad.');
      },
      error: (err) => {
        this.enviandoReporte.set(false);
        this.toast.error(err.message || 'No se pudo enviar el reporte');
      },
    });
  }
}
