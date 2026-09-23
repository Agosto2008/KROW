import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';
import { AuthService } from './api/auth.service';
import { Rol } from './models/Index';

/**
 * Uso en rutas: canActivate: [authGuard, roleGuard(['ADMIN'])]
 * Lee el rol del AuthService (fuente de verdad con signals), no del storage.
 */
export function roleGuard(rolesPermitidos: Rol[]): CanActivateFn {
  return () => {
    const auth = inject(AuthService);
    const router = inject(Router);

    const rol = auth.rol();
    if (rol && rolesPermitidos.includes(rol)) return true;
    return router.createUrlTree(['/']);
  };
}
