import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, Router } from '@angular/router';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { EmpresaService } from '../../../services/empresa.service';
import { PropuestaService } from '../../../services/propuesta.service';
import { TokenStorageService } from '../../../core/token-storage.service';
import { ToastService } from '../../../shader/toast/toast.service';
import { Empresa, Propuesta } from '../../../models/Index';
import { BotonComponent } from '../../../shader/boton/boton.component';
import { BadgeComponent } from '../../../shader/badge/badge.component';
import { ModalComponent } from '../../../shader/modal/modal.component';
import { CampoInputComponent } from '../../../shader/campo-input/campo-input.component';
import { CampoTextareaComponent } from '../../../shader/campo-textarea/campo-textarea.component';
import { SpinnerComponent } from '../../../shader/spinner/spinner.component';
import { EmptyStateComponent } from '../../../shader/empty-state/empty-state.component';

type Tab = 'ofertas' | 'perfil';

@Component({
  selector: 'app-empresa-panel-page',
  standalone: true,
  imports: [CommonModule, RouterLink, ReactiveFormsModule, BotonComponent, BadgeComponent, ModalComponent, CampoInputComponent, CampoTextareaComponent, SpinnerComponent, EmptyStateComponent],
  templateUrl: './panel.page.html',
  styleUrl: './panel.page.css',
})
export class EmpresaPanelPage implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly empresaService = inject(EmpresaService);
  private readonly propuestaService = inject(PropuestaService);
  private readonly tokenStorage = inject(TokenStorageService);
  private readonly toast = inject(ToastService);
  private readonly router = inject(Router);

  readonly empresa = signal<Empresa | null>(null);
  readonly propuestas = signal<Propuesta[]>([]);
  readonly cargando = signal(true);
  readonly tabActiva = signal<Tab>('ofertas');
  readonly modalPerfilAbierto = signal(false);
  readonly guardando = signal(false);

  readonly formPerfil = this.fb.nonNullable.group({
    nombre: ['', Validators.required],
    descripcion: [''],
    propuesta_empresa: [''],
    telefono: [''],
    ubicacion: [''],
  });

  ngOnInit(): void {
    const id = this.tokenStorage.obtenerIdCuenta();
    if (!id) return;

    this.empresaService.listar().subscribe({
      next: (empresas) => {
        const mia = empresas.find((e) => e.cuenta_id === id) ?? null;
        this.empresa.set(mia);
        if (mia) {
          this.formPerfil.patchValue({
            nombre: mia.nombre,
            descripcion: mia.descripcion ?? '',
            propuesta_empresa: mia.propuesta_empresa ?? '',
            telefono: mia.telefono ?? '',
            ubicacion: mia.ubicacion ?? '',
          });
          this.cargarPropuestas(mia.id_empresa);
        } else {
          this.cargando.set(false);
        }
      },
      error: () => this.cargando.set(false),
    });
  }

  private cargarPropuestas(empresaId: number): void {
    this.propuestaService.listar({ empresa_id: empresaId }).subscribe({
      next: (p) => { this.propuestas.set(p); this.cargando.set(false); },
      error: () => this.cargando.set(false),
    });
  }

  setTab(t: Tab): void { this.tabActiva.set(t); }
  abrirPerfil(): void { this.modalPerfilAbierto.set(true); }
  cerrarPerfil(): void { this.modalPerfilAbierto.set(false); }

  guardarPerfil(): void {
    const e = this.empresa();
    if (!e || this.formPerfil.invalid) return;
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

  getVarianteEstado(estado: string): any {
    const mapa: Record<string, string> = {
      ACTIVA: 'estado-activa', PAUSADA: 'estado-pausada',
      CERRADA: 'estado-cerrada', VENCIDA: 'estado-vencida',
    };
    return mapa[estado] ?? 'neutro';
  }
}