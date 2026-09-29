import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';
import { AuthService } from './api/auth.service';
import { ApiError } from './api-error.model';
 
// Traduce el error del backend ({ mensaje, status }) a un ApiError tipado.
// Si es 401, cierra la sesion COMPLETA (storage + signals del AuthService)
// y manda a login: asi navbar y guards se enteran al instante (antes solo se
// limpiaba el storage y los signals quedaban con el rol viejo, con lo que el
// guard dejaba pasar a paginas que volvian a 401 y te expulsaban al picar).
export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const router = inject(Router);
  const auth = inject(AuthService);
 
  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      const mensaje = error.error?.mensaje ?? 'Ocurrió un error inesperado';
 
      if (error.status === 401) {
        auth.logout();
        router.navigate(['/login']);
      }
 
      return throwError(() => new ApiError(mensaje, error.status));
    })
  );
};
 