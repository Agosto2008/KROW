import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../services/auth.service';
import { ToastService } from '../../shader/toast/toast.service';
import { CampoInputComponent } from '../../shader/campo-input/campo-input.component';
import { CampoTextareaComponent } from '../../shader/campo-textarea/campo-textarea.component';
import { BotonComponent } from '../../shader/boton/boton.component';
import { LogoComponent } from '../../shader/logo/logo.component';

@Component({
  selector: 'app-registro-empresa-page',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterLink,
    CampoInputComponent,
    CampoTextareaComponent,
    BotonComponent,
    LogoComponent,
  ],
  templateUrl: './registro-empresa.page.html',
  styleUrl: './registro-empresa.page.css',
})
export class RegistroEmpresaPage {
  private readonly fb = inject(FormBuilder);
  private readonly authService = inject(AuthService);
  private readonly toast = inject(ToastService);
  private readonly router = inject(Router);

  readonly cargando = signal(false);

  readonly form = this.fb.nonNullable.group({
    correo: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]],
    nombre: ['', Validators.required],
    descripcion: [''],
    telefono: [''],
    ubicacion: [''],
  });

  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.cargando.set(true);
    this.authService.registrarEmpresa(this.form.getRawValue()).subscribe({
      next: () => {
        this.toast.exito('¡Empresa registrada! Bienvenida a KROW');
        this.router.navigate(['/empresa/panel']);
      },
      error: (err) => {
        this.cargando.set(false);
        this.toast.error(err.message || 'No se pudo registrar la empresa');
      },
    });
  }
}