import { Component, inject, signal, computed, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { forkJoin } from 'rxjs';
import { AuthService } from '../../../core/api/auth.service';
import { EmpresaService } from '../../../core/api/empresa.service';
import { PropuestaService } from '../../../core/api/propuesta.service';
import { SolicitudService } from '../../../core/api/solicitud.service';
import { EntrevistaService } from '../../../core/api/entrevista.service';
import { ToastService } from '../../../shared/toast/toast.service';
import { Empresa, Propuesta, SolicitudConCandidato, EntrevistaConCandidato } from '../../../core/models/Index';
import { BotonComponent } from '../../../shared/boton/boton.component';
import { BadgeComponent, VarianteBadge } from '../../../shared/badge/badge.component';
import { ModalComponent } from '../../../shared/modal/modal.component';
import { CampoInputComponent } from '../../../shared/campo-input/campo-input.component';
import { CampoTextareaComponent } from '../../../shared/campo-textarea/campo-textarea.component';
import { SpinnerComponent } from '../../../shared/spinner/spinner.component';
import { EmptyStateComponent } from '../../../shared/empty-state/empty-state.component';

type Tab = 'ofertas' | 'perfil';

/** KPI del panel: valor ya formateado en el componente, sin lógica en el template */
interface Kpi {
  etiqueta: string;
  valor: string;
  detalle: string;
  esTexto?: boolean;
}

@Component({
  selector: 'app-empresa-panel-page',
  standalone: true,
  imports: [CommonModule, RouterLink, ReactiveFormsModule, BotonComponent, BadgeComponent, ModalComponent, CampoInputComponent, CampoTextareaComponent, SpinnerComponent, EmptyStateComponent],
  templateUrl: './panel.page.html',
  styleUrl: './panel.page.css',
})
export class EmpresaPanelPage implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly auth = inject(AuthService);
  private readonly empresaService = inject(EmpresaService);
  private readonly propuestaService = inject(PropuestaService);
  private readonly solicitudService = inject(SolicitudService);
  private readonly entrevistaService = inject(EntrevistaService);
  private readonly toast = inject(ToastService);

  readonly empresa = signal<Empresa | null>(null);
  readonly propuestas = signal<Propuesta[]>([]);
  readonly solicitudes = signal<SolicitudConCandidato[]>([]);
  readonly entrevistas = signal<EntrevistaConCandidato[]>([]);
  readonly cargando = signal(true);
  readonly tabActiva = signal<Tab>('ofertas');
  readonly modalPerfilAbierto = signal(false);
  readonly guardando = signal(false);
  readonly modalPasswordAbierto = signal(false);
  readonly guardandoPassword = signal(false);

  /**
   * KPIs reales derivados de las 4 peticiones del ngOnInit.
   * Cero setTimeout: los datos se cargan en paralelo con forkJoin.
   */
  readonly kpis = computed<Kpi[]>(() => {
    const propuestas = this.propuestas();
    const solicitudes = this.solicitudes();
    const entrevistas = this.entrevistas();
    const empresa = this.empresa();

    const activas = propuestas.filter((p) => p.estado === 'ACTIVA').length;
    const porRevisar = solicitudes.filter((s) => s.estado === 'PENDIENTE' || s.estado === 'EN_REVISION').length;
    const programadas = entrevistas.filter((e) => e.estado === 'PROGRAMADA' || e.estado === 'REPROGRAMADA').length;

    return [
      { etiqueta: 'Ofertas activas', valor: String(activas), detalle: `${propuestas.length} publicadas en total` },
      { etiqueta: 'Solicitudes por revisar', valor: String(porRevisar), detalle: `${solicitudes.length} recibidas` },
      { etiqueta: 'Entrevistas programadas', valor: String(programadas), detalle: `${entrevistas.length} en total` },
      {
        etiqueta: 'Verificación',
        valor: empresa?.verificada ? 'Verificada' : 'Sin verificar',
        detalle: empresa?.verificada ? 'Nivel aprobado por KROW' : 'Solicita un plan en Verificación',
        esTexto: true,
      },
    ];
  });

  readonly formPerfil = this.fb.nonNullable.group({
    nombre: ['', Validators.required],
    descripcion: [''],
    propuesta_empresa: [''],
    telefono: [''],
    ubicacion: [''],
  });

  /** Fase 6.7: cambiar contraseña (exige la actual, 8-72 caracteres) */
  readonly formPassword = this.fb.nonNullable.group({
    password_actual: ['', Validators.required],
    password_nueva: ['', [Validators.required, Validators.minLength(8), Validators.maxLength(72)]],
    password_confirmar: ['', Validators.required],
  });

  ngOnInit(): void {
    const idEmpresa = this.auth.idEmpresa();
    if (!idEmpresa) {
      this.cargando.set(false);
      return;
    }

    // 4 peticiones en paralelo (id_empresa sale del token vía /auth/me):
    // antes se bajaba TODA la lista de empresas para encontrar la propia.
    // estado: undefined anula el default 'ACTIVA' de buscar(): el panel debe
    // ver TODAS las ofertas (activas, pausadas, cerradas), no solo las activas
    forkJoin({
      empresa: this.empresaService.obtenerPorId(idEmpresa),
      propuestas: this.propuestaService.buscar({ empresa_id: idEmpresa, por_pagina: 100, estado: undefined }),
      solicitudes: this.solicitudService.listarPorEmpresa(idEmpresa),
      entrevistas: this.entrevistaService.listarPorEmpresa(idEmpresa),
    }).subscribe({
      next: ({ empresa, propuestas, solicitudes, entrevistas }) => {
        this.empresa.set(empresa);
        this.propuestas.set(propuestas.datos);
        this.solicitudes.set(solicitudes);
        this.entrevistas.set(entrevistas);
        this.formPerfil.patchValue({
          nombre: empresa.nombre,
          descripcion: empresa.descripcion ?? '',
          propuesta_empresa: empresa.propuesta_empresa ?? '',
          telefono: empresa.telefono ?? '',
          ubicacion: empresa.ubicacion ?? '',
        });
        this.cargando.set(false);
      },
      error: () => {
        this.cargando.set(false);
        this.toast.error('No se pudo cargar el panel');
      },
    });
  }

  setTab(t: Tab): void { this.tabActiva.set(t); }
  abrirPerfil(): void { this.modalPerfilAbierto.set(true); }
  cerrarPerfil(): void { this.modalPerfilAbierto.set(false); }

  guardarPerfil(): void {
    const e = this.empresa();
    if (!e || this.formPerfil.invalid) { this.formPerfil.markAllAsTouched(); return; }
    this.guardando.set(true);
    this.empresaService.actualizar(e.id_empresa, this.formPerfil.getRawValue()).subscribe({
      next: () => {
        this.toast.exito('Perfil actualizado');
        this.empresa.set({ ...e, ...this.formPerfil.getRawValue() } as Empresa);
        this.guardando.set(false);
        this.cerrarPerfil();
      },
      error: (err) => {
        this.guardando.set(false);
        this.toast.error(err.message || 'No se pudo actualizar');
      },
    });
  }

  // ============================================================
  // Fase 6.7 — cambiar contraseña
  // ============================================================

  abrirPassword(): void {
    this.formPassword.reset();
    this.modalPasswordAbierto.set(true);
  }

  cerrarPassword(): void { this.modalPasswordAbierto.set(false); }

  guardarPassword(): void {
    if (this.formPassword.invalid) { this.formPassword.markAllAsTouched(); return; }
    const { password_actual, password_nueva, password_confirmar } = this.formPassword.getRawValue();

    if (password_nueva !== password_confirmar) {
      this.formPassword.controls.password_confirmar.setErrors({ noCoincide: true });
      this.formPassword.controls.password_confirmar.markAsTouched();
      return;
    }
    if (password_nueva === password_actual) {
      this.toast.error('La nueva contraseña debe ser distinta a la actual');
      return;
    }

    this.guardandoPassword.set(true);
    this.auth.cambiarPassword(password_actual, password_nueva).subscribe({
      next: (res) => {
        this.guardandoPassword.set(false);
        this.toast.exito(res.mensaje || 'Contraseña actualizada');
        this.cerrarPassword();
      },
      error: (err) => {
        this.guardandoPassword.set(false);
        this.toast.error(err.message || 'No se pudo cambiar la contraseña');
      },
    });
  }

  /** Mensaje de error táctil por campo del formulario de contraseña */
  errorPassword(campo: 'password_actual' | 'password_nueva' | 'password_confirmar'): string {
    const control = this.formPassword.controls[campo];
    if (!control.touched) return '';
    if (control.hasError('required')) return 'Este campo es obligatorio';
    if (control.hasError('minlength')) return 'Mínimo 8 caracteres';
    if (control.hasError('maxlength')) return 'Máximo 72 caracteres';
    if (control.hasError('noCoincide')) return 'Las contraseñas no coinciden';
    return '';
  }

  // ============================================================
  // Ofertas
  // ============================================================

  eliminarPropuesta(id: number): void {
    if (!confirm('¿Eliminar esta oferta?')) return;
    this.propuestaService.eliminar(id).subscribe({
      next: () => {
        this.propuestas.update((lista) => lista.filter((p) => p.id_propuesta !== id));
        this.toast.exito('Oferta eliminada');
      },
      error: () => this.toast.error('No se pudo eliminar'),
    });
  }

  get iniciales(): string {
    const e = this.empresa();
    return e ? e.nombre.split(' ').map((x) => x[0]).slice(0, 2).join('').toUpperCase() : '';
  }

  getEtiquetaTipo(t: string): string {
    const mapa: Record<string, string> = {
      PREPRACTICA: 'Prepráctica', PRACTICA: 'Prácticas',
      PASANTIA: 'Pasantía', TRABAJO: 'Trabajo',
    };
    return mapa[t] ?? t;
  }

  getVarianteEstado(estado: string): VarianteBadge {
    const mapa: Record<string, VarianteBadge> = {
      ACTIVA: 'estado-activa', PAUSADA: 'estado-pausada',
      CERRADA: 'estado-cerrada', VENCIDA: 'estado-vencida',
    };
    return mapa[estado] ?? 'neutro';
  }
}
