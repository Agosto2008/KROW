import { HttpInterceptorFn } from '@angular/common/http';

const TOKEN_KEY = 'krow_token';

// Agrega el Bearer token a cada petición si existe en localStorage
export const authInterceptor: HttpInterceptorFn = (req, next) => {
    const token = localStorage.getItem(TOKEN_KEY);
    if (!token) return next(req);

    return next(req.clone({
        setHeaders: { Authorization: `Bearer ${token}` }
    }));
};