import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../../core/api/auth.service';
import { ToastService } from '../../../shared/toast/toast.service';
import { CampoInputComponent } from '../../../shared/campo-input/campo-input.component';
import { BotonComponent } from '../../../shared/boton/boton.component';
import { LogoComponent } from '../../../shared/logo/logo.component';

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
  // shell de auth compartido (sin @import entre páginas)
  styleUrls: ['./registro-usuario.page.css', '../../../shared/estilos/auth.css'],
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

  private enviado = false;

  errorDe(control: 'correo' | 'password' | 'primer_nombre' | 'primer_apellido'): string {
    const c = this.form.controls[control];
    if (!c.touched && !this.enviado) return '';

    if (control === 'correo') {
      if (c.hasError('required')) return 'El correo es obligatorio';
      if (c.hasError('email')) return 'Introduce un correo válido';
    }
    if (control === 'password') {
      if (c.hasError('required')) return 'La contraseña es obligatoria';
      if (c.hasError('minlength')) return 'Mínimo 6 caracteres';
    }
    if (control === 'primer_nombre' && c.hasError('required')) return 'Obligatorio';
    if (control === 'primer_apellido' && c.hasError('required')) return 'Obligatorio';
    return '';
  }

  onSubmit(): void {
    this.enviado = true;
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
