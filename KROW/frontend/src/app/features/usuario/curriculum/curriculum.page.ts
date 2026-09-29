import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { CurriculumService } from '../../../core/api/curriculum.service';
import { AuthService } from '../../../core/api/auth.service';
import { ToastService } from '../../../shared/toast/toast.service';
import { CampoTextareaComponent } from '../../../shared/campo-textarea/campo-textarea.component';
import { CampoInputComponent } from '../../../shared/campo-input/campo-input.component';
import { BotonComponent } from '../../../shared/boton/boton.component';
import { SpinnerComponent } from '../../../shared/spinner/spinner.component';

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
  private readonly auth = inject(AuthService);
  private readonly toast = inject(ToastService);

  readonly cargando = signal(true);
  readonly guardando = signal(false);
  readonly fechaActualizacion = signal<string | null>(null);
  /** true si el backend respondió 404: aún no existe CV (no es un error) */
  readonly sinCurriculum = signal(false);

  readonly form = this.fb.nonNullable.group({
    perfil_profesional: ['', Validators.maxLength(600)],
    campo_laboral: [''],
    campo_estudiantil: [''],
    fortalezas: [''],
    debilidades: [''],
    idiomas: [''],
    habilidades: [''],
    certificaciones: [''],
    portafolio: ['', [Validators.pattern(/^https?:\/\/.+/)]],
  });

  ngOnInit(): void {
    // id_usuario (NO id_cuenta): /curriculums/usuario/:id valida el dueño
    // contra el usuario del token. Con la cuenta salía 403 en el seed.
    const id = this.auth.idUsuario();
    if (!id) {
      this.cargando.set(false);
      return;
    }
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
      // 404 = todavia no tiene CV: se muestra el form vacio (no es un fallo)
      error: () => {
        this.sinCurriculum.set(true);
        this.cargando.set(false);
      },
    });
  }

  /** Error visible del campo para `[error]` del design system */
  errorDe(control: string): string {
    const c = this.form.get(control);
    if (!c || !c.touched) return '';
    if (c.hasError('required')) return 'Este campo es obligatorio';
    if (c.hasError('maxlength')) return 'Demasiado largo';
    if (c.hasError('pattern')) return 'Debe empezar por http:// o https://';
    return '';
  }

  guardar(): void {
    const id = this.auth.idUsuario();
    if (!id) return;

    this.form.markAllAsTouched();
    if (this.form.invalid) {
      this.toast.error('Revisa los campos marcados');
      return;
    }

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