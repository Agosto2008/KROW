import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

@Component({
    selector: 'app-login',
    imports: [FormsModule, RouterLink],
    templateUrl: './login.html',
    styleUrl: './login.css'
})
export class Login {
    private auth = inject(AuthService);
    private router = inject(Router);

    correo = '';
    password = '';
    error = signal<string | null>(null);
    cargando = signal(false);

    onSubmit() {
        if (!this.correo || !this.password) return;
        this.error.set(null);
        this.cargando.set(true);

        this.auth.login(this.correo, this.password).subscribe({
            next: () => {
                const rol = this.auth.rol();
                if (rol === 'ADMIN') this.router.navigate(['/admin']);
                else if (rol === 'EMPRESA') this.router.navigate(['/mis-propuestas']);
                else this.router.navigate(['/propuestas']);
            },
            error: (e) => {
                this.error.set(e.error?.mensaje || 'Credenciales inválidas');
                this.cargando.set(false);
            }
        });
    }
}