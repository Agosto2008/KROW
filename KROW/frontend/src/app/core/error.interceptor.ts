import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';
import { TokenStorageService } from './token-storage.service';
import { ApiError } from './api-error.model';

// Traduce el error del backend ({ mensaje, status }) a un ApiError tipado.
// Si es 401, limpia sesión y manda a login.
export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const router = inject(Router);
  const tokenStorage = inject(TokenStorageService);

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      const mensaje = error.error?.mensaje ?? 'Ocurrió un error inesperado';

      if (error.status === 401) {
        tokenStorage.limpiarSesion();
        router.navigate(['/login']);
      }

      return throwError(() => new ApiError(mensaje, error.status));
    })
  );
};