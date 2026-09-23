import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { RolCuenta } from '../models/cuenta.model';

// Fábrica de guards por rol: roleGuard('EMPRESA') o roleGuard('ADMIN','EMPRESA')
export const roleGuard = (...roles: RolCuenta[]): CanActivateFn => () => {
    const auth = inject(AuthService);
    const router = inject(Router);

    const rol = auth.rol();
    if (rol && roles.includes(rol)) return true;
    router.navigate(['/']);
    return false;
};