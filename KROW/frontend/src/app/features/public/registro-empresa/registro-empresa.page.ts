import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../../core/api/auth.service';
import { ToastService } from '../../../shared/toast/toast.service';
import { CampoInputComponent } from '../../../shared/campo-input/campo-input.component';
import { CampoTextareaComponent } from '../../../shared/campo-textarea/campo-textarea.component';
import { BotonComponent } from '../../../shared/boton/boton.component';
import { LogoComponent } from '../../../shared/logo/logo.component';
 
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
  // shell de auth compartido (sin @import entre páginas)
  styleUrls: ['./registro-empresa.page.css', '../../../shared/estilos/auth.css'],
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
 
  private enviado = false;
 
  errorDe(control: 'correo' | 'password' | 'nombre'): string {
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
    if (control === 'nombre' && c.hasError('required')) return 'El nombre es obligatorio';
    return '';
  }
 
  onSubmit(): void {
    this.enviado = true;
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
 
    this.cargando.set(true);
    this.authService.registrarEmpresa(this.form.getRawValue()).subscribe({
      next: () => {
        this.toast.exito('¡Empresa registrada! Bienvenida a KROW');
        // trae el perfil de una vez: navbar y panel entran con los ids listos
        this.authService.cargarSesion().subscribe({
          complete: () => this.router.navigate(['/empresa/panel']),
          error: () => this.router.navigate(['/empresa/panel']),
        });
      },
      error: (err) => {
        this.cargando.set(false);
        this.toast.error(err.message || 'No se pudo registrar la empresa');
      },
    });
  }
}
 
 