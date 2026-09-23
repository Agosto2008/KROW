import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-registro-usuario',
  imports: [FormsModule, RouterLink],
  template: `
    <div class="auth-wrap">
      <form class="card auth-card" (submit)="onSubmit(); $event.preventDefault()">
        <h1>Registro de usuario</h1>
        <p class="sub">Encuentra prácticas, pasantías y trabajos</p>

        <div class="field"><label>Correo</label><input type="email" [(ngModel)]="f.correo" name="correo" required /></div>
        <div class="field"><label>Contraseña</label><input type="password" [(ngModel)]="f.password" name="password" required /></div>
        <div class="field"><label>Primer nombre</label><input [(ngModel)]="f.primer_nombre" name="pn" required /></div>
        <div class="field"><label>Primer apellido</label><input [(ngModel)]="f.primer_apellido" name="pa" required /></div>
        <div class="field"><label>Teléfono (opcional)</label><input [(ngModel)]="f.telefono" name="tel" /></div>

        @if (error()) { <p class="error">{{ error() }}</p> }

        <button class="btn" type="submit" [disabled]="cargando()">
          {{ cargando() ? 'Creando...' : 'Crear cuenta' }}
        </button>
        <div class="links"><a routerLink="/login">Ya tengo cuenta</a></div>
      </form>
    </div>
  `,
  styleUrl: '../login/login.css'
})
export class RegistroUsuario {
  private auth = inject(AuthService);
  private router = inject(Router);

  f = { correo: '', password: '', primer_nombre: '', primer_apellido: '', telefono: '' };
  error = signal<string | null>(null);
  cargando = signal(false);

  onSubmit() {
    this.error.set(null);
    this.cargando.set(true);
    this.auth.registrarUsuario(this.f).subscribe({
      next: () => {
        const rol = this.auth.rol();
        if (rol === 'ADMIN') this.router.navigate(['/admin']);
        else if (rol === 'EMPRESA') this.router.navigate(['/mis-propuestas']);
        else this.router.navigate(['/propuestas']);
      }, error: (e) => { this.error.set(e.error?.mensaje || 'Error al registrar'); this.cargando.set(false); }
    });
  }
}