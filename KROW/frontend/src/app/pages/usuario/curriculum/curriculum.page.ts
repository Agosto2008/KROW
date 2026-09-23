import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { CurriculumService } from '../../../services/curriculum.service';
import { TokenStorageService } from '../../../core/token-storage.service';
import { ToastService } from '../../../shader/toast/toast.service';
import { CampoTextareaComponent } from '../../../shader/campo-textarea/campo-textarea.component';
import { CampoInputComponent } from '../../../shader/campo-input/campo-input.component';
import { BotonComponent } from '../../../shader/boton/boton.component';
import { SpinnerComponent } from '../../../shader/spinner/spinner.component';

@Component({
  selector: 'app-curriculum-page',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, CampoTextareaComponent, CampoInputComponent, BotonComponent, SpinnerComponent],
  templateUrl: './curriculum.page.html',
  styleUrl: './curriculum.page.css',
})
export class CurriculumPage implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly curriculumService = inject(CurriculumService);
  private readonly tokenStorage = inject(TokenStorageService);
  private readonly toast = inject(ToastService);

  readonly cargando = signal(true);
  readonly guardando = signal(false);
  readonly fechaActualizacion = signal<string | null>(null);

  readonly form = this.fb.nonNullable.group({
    perfil_profesional: [''],
    campo_laboral: [''],
    campo_estudiantil: [''],
    fortalezas: [''],
    debilidades: [''],
    idiomas: [''],
    habilidades: [''],
    certificaciones: [''],
    portafolio: [''],
  });

  ngOnInit(): void {
    const id = this.tokenStorage.obtenerIdCuenta();
    if (!id) return;
    this.curriculumService.obtenerPorUsuario(id).subscribe({
      next: (c) => {
        this.form.patchValue({
          perfil_profesional: c.perfil_profesional ?? '',
          campo_laboral: c.campo_laboral ?? '',
          campo_estudiantil: c.campo_estudiantil ?? '',
          fortalezas: c.fortalezas ?? '',
          debilidades: c.debilidades ?? '',
          idiomas: c.idiomas ?? '',
          habilidades: c.habilidades ?? '',
          certificaciones: c.certificaciones ?? '',
          portafolio: c.portafolio ?? '',
        });
        this.fechaActualizacion.set(c.fecha_actualizacion);
        this.cargando.set(false);
      },
      error: () => this.cargando.set(false),
    });
  }

  guardar(): void {
    const id = this.tokenStorage.obtenerIdCuenta();
    if (!id) return;
    this.guardando.set(true);
    this.curriculumService.guardar(id, this.form.getRawValue()).subscribe({
      next: () => {
        this.toast.exito('Curriculum guardado');
        this.guardando.set(false);
        this.fechaActualizacion.set(new Date().toISOString());
      },
      error: (err) => {
        this.guardando.set(false);
        this.toast.error(err.message || 'No se pudo guardar');
      },
    });
  }
}