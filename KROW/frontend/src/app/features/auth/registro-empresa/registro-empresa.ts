import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

@Component({
    selector: 'app-registro-empresa',
    imports: [FormsModule, RouterLink],
    template: `
    <div class="auth-wrap">
      <form class="card auth-card" (submit)="onSubmit(); $event.preventDefault()">
        <h1>Registrar empresa</h1>
        <p class="sub">Publica propuestas y encuentra talento</p>

        <div class="field"><label>Correo corporativo</label><input type="email" [(ngModel)]="f.correo" name="correo" required /></div>
        <div class="field"><label>Contraseña</label><input type="password" [(ngModel)]="f.password" name="password" required /></div>
        <div class="field"><label>Nombre de la empresa</label><input [(ngModel)]="f.nombre" name="nombre" required /></div>
        <div class="field"><label>Descripción</label><textarea rows="3" [(ngModel)]="f.descripcion" name="desc"></textarea></div>
        <div class="field"><label>Teléfono</label><input [(ngModel)]="f.telefono" name="tel" /></div>
        <div class="field"><label>Ubicación</label><input [(ngModel)]="f.ubicacion" name="ubi" /></div>

        @if (error()) { <p class="error">{{ error() }}</p> }

        <button class="btn" type="submit" [disabled]="cargando()">
          {{ cargando() ? 'Registrando...' : 'Registrar empresa' }}
        </button>
        <div class="links"><a routerLink="/login">Ya tengo cuenta</a></div>
      </form>
    </div>
  `,
    styleUrl: '../login/login.css'
})
export class RegistroEmpresa {
    private auth = inject(AuthService);
    private router = inject(Router);

    f = { correo: '', password: '', nombre: '', descripcion: '', telefono: '', ubicacion: '' };
    error = signal<string | null>(null);
    cargando = signal(false);

    onSubmit() {
        this.error.set(null);
        this.cargando.set(true);
        this.auth.registrarEmpresa(this.f).subscribe({
            next: () => this.router.navigate(['/mis-propuestas']),
            error: (e) => { this.error.set(e.error?.mensaje || 'Error al registrar'); this.cargando.set(false); }
        });
    }
}