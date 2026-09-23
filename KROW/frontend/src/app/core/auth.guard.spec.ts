import { EnvironmentInjector, runInInjectionContext } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import {
  ActivatedRouteSnapshot,
  CanActivateFn,
  Router,
  RouterStateSnapshot,
  UrlTree,
  provideRouter,
} from '@angular/router';
import { Observable } from 'rxjs';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { authGuard } from './auth.guard';
import { AuthService } from './api/auth.service';
import { TokenStorageService } from './token-storage.service';

const API = '/api';
type Resultado = ReturnType<CanActivateFn>;

/** Tests de humo (Fase 8.3) de la guardia de sesión */
describe('authGuard', () => {
  let httpMock: HttpTestingController;
  let storage: TokenStorageService;
  let router: Router;

  const rutaSnapshot = {} as ActivatedRouteSnapshot;

  const ejecutar = (url: string): Resultado =>
    runInInjectionContext(TestBed.inject(EnvironmentInjector), () =>
      authGuard(rutaSnapshot, { url } as RouterStateSnapshot)
    );

  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({
      providers: [provideRouter([]), provideHttpClient(), provideHttpClientTesting()],
    });
    httpMock = TestBed.inject(HttpTestingController);
    storage = TestBed.inject(TokenStorageService);
    router = TestBed.inject(Router);
  });

  afterEach(() => {
    httpMock.verify();
    localStorage.clear();
  });

  it('sin token redirige a /login con returnUrl', () => {
    const r = ejecutar('/usuario/perfil');

    expect(r).toBeInstanceOf(UrlTree);
    expect(router.serializeUrl(r as UrlTree)).toBe('/login?returnUrl=%2Fusuario%2Fperfil');
  });

  it('con token espera a /me y deja pasar cuando el servidor responde', () => {
    storage.guardarSesion({ token: 'tk', rol: 'USUARIO', id_cuenta: 2 });

    const r = ejecutar('/usuario/perfil') as Observable<boolean | UrlTree>;
    let resultado: boolean | UrlTree | undefined;
    r.subscribe((v) => (resultado = v));

    httpMock.expectOne(`${API}/auth/me`).flush({
      rol: 'USUARIO',
      perfil: { id_usuario: 7 },
    });
    expect(resultado).toBe(true);
  });

  it('si /me responde 401 redirige a /login con la ruta de vuelta', () => {
    storage.guardarSesion({ token: 'tk', rol: 'USUARIO', id_cuenta: 2 });

    const r = ejecutar('/usuario/curriculum') as Observable<boolean | UrlTree>;
    let resultado: boolean | UrlTree | undefined;
    r.subscribe((v) => (resultado = v));

    httpMock.expectOne(`${API}/auth/me`).flush({}, { status: 401, statusText: 'Unauthorized' });

    expect(resultado).toBeInstanceOf(UrlTree);
    expect(router.serializeUrl(resultado as UrlTree)).toBe(
      '/login?returnUrl=%2Fusuario%2Fcurriculum'
    );
  });

  it('con la sesión ya refrescada decide sin volver a llamar a /me', () => {
    storage.guardarSesion({ token: 'tk', rol: 'EMPRESA', id_cuenta: 4 });
    TestBed.inject(AuthService).cargarSesion().subscribe();
    httpMock.expectOne(`${API}/auth/me`).flush({ rol: 'EMPRESA', perfil: { id_empresa: 3 } });

    const r = ejecutar('/empresa/panel');

    expect(r).toBe(true);
    httpMock.expectNone(`${API}/auth/me`);
  });
});
