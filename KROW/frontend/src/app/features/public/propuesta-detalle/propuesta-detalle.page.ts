import { Component, inject, signal, OnInit } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PropuestaService } from '../../../core/api/propuesta.service';
import { SolicitudService } from '../../../core/api/solicitud.service';
import { FavoritoService } from '../../../core/api/favorito.service';
import { ReporteService } from '../../../core/api/reporte.service';
import { AuthService } from '../../../core/api/auth.service';
import { ToastService } from '../../../shared/toast/toast.service';
import { PropuestaConEmpresa, EmpresaEnDetalle, MotivoReporte, MOTIVOS_REPORTE } from '../../../core/models/Index';
import { BotonComponent } from '../../../shared/boton/boton.component';
import { BadgeComponent } from '../../../shared/badge/badge.component';
import { AvatarEmpresaComponent } from '../../../shared/avatar-empresa/avatar-empresa.component';
import { SpinnerComponent } from '../../../shared/spinner/spinner.component';
import { EmptyStateComponent } from '../../../shared/empty-state/empty-state.component';
import { ModalComponent } from '../../../shared/modal/modal.component';
import { CampoSelectComponent, OpcionSelect } from '../../../shared/campo-select/campo-select.component';
import { CampoTextareaComponent } from '../../../shared/campo-textarea/campo-textarea.component';

@Component({
  selector: 'app-propuesta-detalle-page',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    BotonComponent,
    BadgeComponent,
    AvatarEmpresaComponent,
    SpinnerComponent,
    EmptyStateComponent,
    ModalComponent,
    CampoSelectComponent,
    CampoTextareaComponent,
    FormsModule,
  ],
  templateUrl: './propuesta-detalle.page.html',
  styleUrl: './propuesta-detalle.page.css',
})
export class PropuestaDetallePage implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly propuestaService = inject(PropuestaService);
  private readonly solicitudService = inject(SolicitudService);
  private readonly favoritoService = inject(FavoritoService);
  private readonly reporteService = inject(ReporteService);
  private readonly auth = inject(AuthService);
  private readonly toast = inject(ToastService);

  /** 1 sola petición: el backend devuelve propuesta + empresa embebida */
  readonly detalle = signal<PropuestaConEmpresa | null>(null);
  readonly cargando = signal(true);
  readonly esFavorito = signal(false);
  readonly yaPostulo = signal(false);
  readonly aplicando = signal(false);


  // modal de reporte (Fase 4.5)
  readonly modalReporteAbierto = signal(false);
  readonly enviandoReporte = signal(false);
  readonly motivosReporte: OpcionSelect[] = MOTIVOS_REPORTE;

  /** Estado plano del modal de reporte (two-way con ngModel) */
  motivoReporte: MotivoReporte = 'OFERTA_FALSA';
  detalleReporte = '';

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    if (!id) {
      this.router.navigate(['/propuestas']);
      return;
    }
    this.cargar(id);
  }

  private cargar(id: number): void {
    this.propuestaService.obtenerPorId(id).subscribe({
      next: (detalle) => {
        this.detalle.set(detalle);
        this.cargando.set(false);
        this.cargarEstadoUsuario(id);
      },
      error: () => {
        this.cargando.set(false);
        this.toast.error('No se encontró la propuesta');
        this.router.navigate(['/propuestas']);
      },
    });
  }

  /** Favoritos + si ya postuló (solo si hay sesión de candidato) */
  private cargarEstadoUsuario(propuestaId: number): void {
    const idUsuario = this.auth.idUsuario();
    if (!idUsuario) return;

    this.favoritoService.listar(idUsuario).subscribe({
      next: (favs) => this.esFavorito.set(favs.some((f) => f.id_propuesta === propuestaId)),
      error: () => {},
    });

    this.solicitudService.listarPorUsuario(idUsuario).subscribe({
      next: (sols) => this.yaPostulo.set(sols.some((s) => s.propuesta_id === propuestaId)),
      error: () => {},
    });
  }

  get detalleData(): PropuestaConEmpresa | null {
    return this.detalle();
  }

  get empresa(): EmpresaEnDetalle | null {
    return this.detalle()?.empresa ?? null;
  }

  get etiquetaTipo(): string {
    const p = this.detalle();
    if (!p) return '';
    const mapa: Record<string, string> = {
      PREPRACTICA: 'Prepráctica',
      PRACTICA: 'Prácticas',
      PASANTIA: 'Pasantía',
      TRABAJO: 'Trabajo',
    };
    return mapa[p.tipo] ?? p.tipo;
  }

  get pagoTexto(): string {
    const p = this.detalle();
    if (!p || p.pago == null) return 'No remunerado';
    return `${p.pago} €/mes`;
  }

  onAplicar(): void {
    const p = this.detalle();

    if (!this.auth.autenticado()) {
      this.toast.info('Inicia sesión como candidato para aplicar');
      this.router.navigate(['/login'], { queryParams: { returnUrl: this.router.url } });
      return;
    }
    if (this.auth.rol() !== 'USUARIO') {
      this.toast.info('Solo los candidatos pueden postular a ofertas');
      return;
    }
    if (!p) return;

    this.aplicando.set(true);
    this.solicitudService.aplicar(p.id_propuesta).subscribe({
      next: () => {
        this.aplicando.set(false);
        this.yaPostulo.set(true);
        this.toast.exito('¡Solicitud enviada!');
      },
      error: (err) => {
        this.aplicando.set(false);
        this.toast.error(err.message || 'No se pudo aplicar');
      },
    });
  }

  onToggleFavorito(): void {
    const p = this.detalle();
    if (!p) return;

    if (this.auth.rol() !== 'USUARIO') {
      this.toast.info('Inicia sesión como candidato para guardar ofertas');
      return;
    }

    this.favoritoService.alternar(p.id_propuesta).subscribe({
      next: (res) => {
        const ahoraFav = res.mensaje === 'agregado';
        this.esFavorito.set(ahoraFav);
        this.toast.exito(ahoraFav ? 'Guardado' : 'Eliminado de guardados');
      },
      error: () => this.toast.error('No se pudo actualizar'),
    });
  }

  // ============================================================
  // Reportar oferta (Fase 4.5 / 2.14)
  // ============================================================

  abrirReporte(): void {
    if (this.auth.rol() !== 'USUARIO') {
      this.toast.info('Inicia sesión como candidato para reportar ofertas');
      return;
    }
    this.motivoReporte = 'OFERTA_FALSA';
    this.detalleReporte = '';
    this.modalReporteAbierto.set(true);
  }

  cerrarReporte(): void {
    if (this.enviandoReporte()) return;
    this.modalReporteAbierto.set(false);
  }

  enviarReporte(): void {
    const p = this.detalle();
    if (!p) return;

    const detalle = this.detalleReporte.trim();
    if (!detalle) {
      this.toast.error('Explica brevemente el motivo del reporte');
      return;
    }

    this.enviandoReporte.set(true);
    this.reporteService.crear({
      motivo: this.motivoReporte,
      descripcion: detalle,
      propuesta_id: p.id_propuesta,
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
