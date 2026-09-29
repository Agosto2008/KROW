import { EnvironmentInjector, runInInjectionContext } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import {
  ActivatedRouteSnapshot,
  Router,
  RouterStateSnapshot,
  UrlTree,
  provideRouter,
} from '@angular/router';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { roleGuard } from './role.guard';
import { AuthService } from './api/auth.service';
import { TokenStorageService } from './token-storage.service';
import { Rol } from './models/Index';

/** Tests de humo (Fase 8.3) de la guardia de rol */
describe('roleGuard', () => {
  let storage: TokenStorageService;
  let router: Router;

  const rutaSnapshot = {} as ActivatedRouteSnapshot;

  const ejecutar = (permitidos: Rol[]): boolean | UrlTree =>
    runInInjectionContext(TestBed.inject(EnvironmentInjector), () =>
      roleGuard(permitidos)(rutaSnapshot, { url: '/admin/panel' } as RouterStateSnapshot)
    ) as boolean | UrlTree;

  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({
      providers: [provideRouter([]), provideHttpClient(), provideHttpClientTesting()],
    });
    storage = TestBed.inject(TokenStorageService);
    router = TestBed.inject(Router);
  });

  afterEach(() => {
    localStorage.clear();
  });

  it('con rol permitido deja pasar', () => {
    storage.guardarSesion({ token: 'tk', rol: 'ADMIN', id_cuenta: 1 });
    TestBed.inject(AuthService); // construye la sesión con el rol del storage

    expect(ejecutar(['ADMIN'])).toBe(true);
  });

  it('ADMite cualquier rol de la lista', () => {
    storage.guardarSesion({ token: 'tk', rol: 'EMPRESA', id_cuenta: 1 });
    TestBed.inject(AuthService);

    expect(ejecutar(['EMPRESA', 'ADMIN'])).toBe(true);
  });

  it('con rol no permitido redirige al inicio', () => {
    storage.guardarSesion({ token: 'tk', rol: 'USUARIO', id_cuenta: 1 });
    TestBed.inject(AuthService);

    const r = ejecutar(['ADMIN']);
    expect(r).toBeInstanceOf(UrlTree);
    expect(router.serializeUrl(r as UrlTree)).toBe('/');
  });

  it('sin rol redirige al inicio', () => {
    TestBed.inject(AuthService); // storage vacío

    const r = ejecutar(['ADMIN']);
    expect(r).toBeInstanceOf(UrlTree);
    expect(router.serializeUrl(r as UrlTree)).toBe('/');
  });
});
