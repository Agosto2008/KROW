import { Component, inject } from '@angular/core';
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

@Component({
    selector: 'app-main-layout',
    imports: [RouterOutlet, RouterLink, RouterLinkActive],
    templateUrl: './main-layout.html',
    styleUrl: './main-layout.css'
})
export class MainLayout {
    auth = inject(AuthService);
    private router = inject(Router);

    cerrarSesion() {
        this.auth.cerrarSesion();
        this.router.navigate(['/login']);
    }

    etiquetaRol(): string {
        const r = this.auth.rol();
        if (r === 'ADMIN') return 'Administrador';
        if (r === 'EMPRESA') return 'Empresa';
        if (r === 'USUARIO') return 'Estudiante';
        return '';
    }

    inicial(): string {
        return this.etiquetaRol().charAt(0).toUpperCase();
    }
}