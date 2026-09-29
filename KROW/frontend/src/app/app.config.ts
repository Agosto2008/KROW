import { ApplicationConfig, inject, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideRouter, withComponentInputBinding, withInMemoryScrolling } from '@angular/router';
import { provideHttpClient, withFetch, withInterceptors } from '@angular/common/http';
import { provideAppInitializer } from '@angular/core';

import { routes } from './app.routes';
import { authInterceptor } from './core/auth.interceptor';
import { errorInterceptor } from './core/error.interceptor';
import { AuthService } from './core/api/auth.service';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    // SPA pura (sin SSR): el router recupera el scroll en cada navegacion
    provideRouter(
      routes,
      withComponentInputBinding(),
      withInMemoryScrolling({ scrollPositionRestoration: 'top' })
    ),
    provideHttpClient(withFetch(), withInterceptors([authInterceptor, errorInterceptor])),
    // Al arrancar, si hay token guardado, refresca el perfil desde /auth/me
    // antes de resolver guards/rutas: asi el rol e ids estan siempre frescos.
    provideAppInitializer(() => inject(AuthService).cargarSesion()),
  ],
};
