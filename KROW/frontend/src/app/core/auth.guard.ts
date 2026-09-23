import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';
import { of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { AuthService } from './api/auth.service';

/**
 * Exige estar logueado.
 * Si hay token pero el perfil aún no se refrescó (recarga de página),
 * espera a /auth/me antes de decidir, para que el guard de rol no
 * trabaje con un rol viejo de localStorage.
 */
export const authGuard: CanActivateFn = (route, state) => {
  const auth = inject(AuthService);
  const router = inject(Router);

  const denegado = () =>
    router.createUrlTree(['/login'], { queryParams: { returnUrl: state.url } });

  if (!auth.estaAutenticado()) return denegado();

  // sesión ya refrescada en este arranque: decisión inmediata
  if (auth.meListo()) return auth.rol() ? true : denegado();

  // token presente pero sin refrescar: esperar a /auth/me
  return auth.cargarSesion().pipe(
    map(() => (auth.rol() ? true : denegado())),
    catchError(() => of(denegado()))
  );
};
