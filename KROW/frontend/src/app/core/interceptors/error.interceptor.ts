import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { catchError, throwError } from 'rxjs';
import { inject } from '@angular/core';
import { Router } from '@angular/router';

const TOKEN_KEY = 'krow_token';

// Si el backend responde 401, cerramos sesión y mandamos al login
export const errorInterceptor: HttpInterceptorFn = (req, next) => {
    const router = inject(Router);

    return next(req).pipe(
        catchError((error: HttpErrorResponse) => {
            if (error.status === 401) {
                localStorage.removeItem(TOKEN_KEY);
                localStorage.removeItem('krow_rol');
                localStorage.removeItem('krow_id_cuenta');
                router.navigate(['/login']);
            }
            return throwError(() => error);
        })
    );
};