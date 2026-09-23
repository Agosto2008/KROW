import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink, ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../services/auth.service';
import { ToastService } from '../../shader/toast/toast.service';
import { CampoInputComponent } from '../../shader/campo-input/campo-input.component';
import { BotonComponent } from '../../shader/boton/boton.component';
import { LogoComponent } from '../../shader/logo/logo.component';

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
  styleUrl: './login.page.css',
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

  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.cargando.set(true);
    const { correo, password } = this.form.getRawValue();

    this.authService.login(correo, password).subscribe({
      next: () => {
        this.toast.exito('Bienvenido de nuevo');
        const returnUrl = this.route.snapshot.queryParamMap.get('returnUrl') || '/';
        this.router.navigateByUrl(returnUrl);
      },
      error: (err) => {
        this.cargando.set(false);
        this.toast.error(err.message || 'Credenciales inválidas');
      },
    });
  }
}