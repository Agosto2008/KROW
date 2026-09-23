import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../services/auth.service';
import { ToastService } from '../../shader/toast/toast.service';
import { CampoInputComponent } from '../../shader/campo-input/campo-input.component';
import { BotonComponent } from '../../shader/boton/boton.component';
import { LogoComponent } from '../../shader/logo/logo.component';

@Component({
  selector: 'app-registro-usuario-page',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterLink,
    CampoInputComponent,
    BotonComponent,
    LogoComponent,
  ],
  templateUrl: './registro-usuario.page.html',
  styleUrl: './registro-usuario.page.css',
})
export class RegistroUsuarioPage {
  private readonly fb = inject(FormBuilder);
  private readonly authService = inject(AuthService);
  private readonly toast = inject(ToastService);
  private readonly router = inject(Router);

  readonly cargando = signal(false);

  readonly form = this.fb.nonNullable.group({
    correo: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]],
    primer_nombre: ['', Validators.required],
    segundo_nombre: [''],
    primer_apellido: ['', Validators.required],
    segundo_apellido: [''],
    telefono: [''],
  });

  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.cargando.set(true);
    this.authService.registrarUsuario(this.form.getRawValue()).subscribe({
      next: () => {
        this.toast.exito('¡Cuenta creada! Bienvenido a KROW');
        this.router.navigate(['/usuario/perfil']);
      },
      error: (err) => {
        this.cargando.set(false);
        this.toast.error(err.message || 'No se pudo crear la cuenta');
      },
    });
  }
}