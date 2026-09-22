import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';
import { TokenStorageService } from './token-storage.service';
import { Rol } from '../models';

// Uso en rutas: canActivate: [authGuard, roleGuard(['ADMIN'])]
export function roleGuard(rolesPermitidos: Rol[]): CanActivateFn {
  return () => {
    const tokenStorage = inject(TokenStorageService);
    const router = inject(Router);

    const rol = tokenStorage.obtenerRol();
    if (rol && rolesPermitidos.includes(rol)) return true;
    return router.createUrlTree(['/']);
  };
}