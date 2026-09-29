import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink, ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../../core/api/auth.service';
import { ToastService } from '../../../shared/toast/toast.service';
import { CampoInputComponent } from '../../../shared/campo-input/campo-input.component';
import { BotonComponent } from '../../../shared/boton/boton.component';
import { LogoComponent } from '../../../shared/logo/logo.component';
 
@Component({
  selector: 'app-login-page',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterLink,
    CampoInputComponent,
    BotonComponent,
    LogoComponent,
  ],
  templateUrl: './login.page.html',
  // el shell de auth es compartido: se trae por styleUrls, sin @import entre páginas
  styleUrls: ['./login.page.css', '../../../shared/estilos/auth.css'],
})
export class LoginPage {
  private readonly fb = inject(FormBuilder);
  private readonly authService = inject(AuthService);
  private readonly toast = inject(ToastService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
 
  readonly cargando = signal(false);
 
  readonly form = this.fb.nonNullable.group({
    correo: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]],
  });
 
  /** Errores conectados al [error] del campo (solo tras tocar/mandar) */
  get errorCorreo(): string {
    const c = this.form.controls.correo;
    if (!c.touched && !this.enviado) return '';
    if (c.hasError('required')) return 'El correo es obligatorio';
    if (c.hasError('email')) return 'Introduce un correo válido';
    return '';
  }
 
  get errorPassword(): string {
    const c = this.form.controls.password;
    if (!c.touched && !this.enviado) return '';
    if (c.hasError('required')) return 'La contraseña es obligatoria';
    if (c.hasError('minlength')) return 'Mínimo 6 caracteres';
    return '';
  }
 
  private enviado = false;
 
  onSubmit(): void {
    this.enviado = true;
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
 
    this.cargando.set(true);
    const { correo, password } = this.form.getRawValue();
 
    this.authService.login(correo, password).subscribe({
      next: () => {
        const returnUrl = this.route.snapshot.queryParamMap.get('returnUrl') || '/';
        // /me antes de navegar: el navbar entra con perfil e ids resueltos
        this.authService.cargarSesion().subscribe({
          complete: () => this.entrar(returnUrl),
          error: () => this.entrar(returnUrl),
        });
      },
      error: (err) => {
        this.cargando.set(false);
        this.toast.error(err.message || 'Credenciales inválidas');
      },
    });
  }
 
  private entrar(returnUrl: string): void {
    this.toast.exito('Bienvenido de nuevo');
    this.router.navigateByUrl(returnUrl);
  }
}
 
 