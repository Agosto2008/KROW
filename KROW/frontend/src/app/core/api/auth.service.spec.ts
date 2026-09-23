import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { AuthResponse, AuthService } from './auth.service';
import { TokenStorageService } from '../token-storage.service';

const API = '/api';

/**
 * Tests de humo (Fase 8.3) de la fuente única de sesión.
 * Cubren la regresión histórica: id_usuario/id_empresa NUNCA son id_cuenta.
 */
describe('AuthService', () => {
  let httpMock: HttpTestingController;
  let storage: TokenStorageService;

  /** Crea el servicio DESPUÉS de dejar el storage como lo necesite cada test */
  const crearServicio = (): AuthService => TestBed.inject(AuthService);

  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    httpMock = TestBed.inject(HttpTestingController);
    storage = TestBed.inject(TokenStorageService);
  });

  afterEach(() => {
    httpMock.verify();
    localStorage.clear();
  });

  it('cargarSesion sin token: resuelve null, marca meListo y no llama a /me', () => {
    const auth = crearServicio();

    let resultado: unknown = 'pendiente';
    auth.cargarSesion().subscribe((v) => (resultado = v));

    expect(resultado).toBeNull();
    expect(auth.meListo()).toBe(true);
    expect(auth.estaAutenticado()).toBe(false);
    expect(auth.rol()).toBeNull();
    httpMock.expectNone(`${API}/auth/me`);
  });

  it('login guarda token, rol e id_cuenta y deja meListo en false', () => {
    const auth = crearServicio();

    let respuesta: AuthResponse | null = null;
    auth.login('admin@krow.com', 'secreta').subscribe((r) => (respuesta = r));

    const req = httpMock.expectOne(`${API}/auth/login`);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual({ correo: 'admin@krow.com', password: 'secreta' });
    req.flush({ token: 'tk-123', rol: 'ADMIN', id_cuenta: 9 });

    expect(respuesta).not.toBeNull();
    expect(storage.obtenerToken()).toBe('tk-123');
    expect(storage.obtenerRol()).toBe('ADMIN');
    expect(storage.obtenerIdCuenta()).toBe(9);
    expect(auth.rol()).toBe('ADMIN');
    expect(auth.idCuenta()).toBe(9);
    // el perfil llega con /me (lo dispara la página de login)
    expect(auth.meListo()).toBe(false);
    expect(auth.idUsuario()).toBeNull();
  });

  it('USUARIO: idUsuario se deriva de /me y difiere de id_cuenta (regresión)', () => {
    // id_cuenta = 9 en storage; el servidor devuelve id_usuario = 7
    storage.guardarSesion({ token: 'tk', rol: 'USUARIO', id_cuenta: 9 });
    const auth = crearServicio();

    let ok = false;
    auth.cargarSesion().subscribe(() => (ok = true));
    const req = httpMock.expectOne(`${API}/auth/me`);
    expect(req.request.method).toBe('GET');
    req.flush({
      rol: 'USUARIO',
      perfil: { id_usuario: 7, primer_nombre: 'Ana', primer_apellido: 'Pérez' },
    });

    expect(ok).toBe(true);
    expect(auth.idCuenta()).toBe(9);
    expect(auth.idUsuario()).toBe(7); // ¡9 ≠ 7! Nunca confundirlos
    expect(auth.idEmpresa()).toBeNull();
    expect(auth.rol()).toBe('USUARIO');
    expect(auth.meListo()).toBe(true);
    expect(storage.obtenerRol()).toBe('USUARIO'); // rol re-sincronizado por el servidor
  });

  it('EMPRESA: idEmpresa se deriva de /me', () => {
    storage.guardarSesion({ token: 'tk', rol: 'EMPRESA', id_cuenta: 4 });
    const auth = crearServicio();

    auth.cargarSesion().subscribe();
    httpMock.expectOne(`${API}/auth/me`).flush({
      rol: 'EMPRESA',
      perfil: { id_empresa: 3, nombre: 'TechLab' },
    });

    expect(auth.idEmpresa()).toBe(3);
    expect(auth.idUsuario()).toBeNull();
    expect(auth.idCuenta()).toBe(4);
  });

  it('si /me falla, meListo queda en true (los guards no se cuelgan)', () => {
    storage.guardarSesion({ token: 'tk', rol: 'USUARIO', id_cuenta: 9 });
    const auth = crearServicio();

    let fallo = false;
    auth.cargarSesion().subscribe({ error: () => (fallo = true) });
    httpMock
      .expectOne(`${API}/auth/me`)
      .flush({}, { status: 401, statusText: 'Unauthorized' });

    expect(fallo).toBe(true);
    expect(auth.meListo()).toBe(true);
  });

  it('logout limpia storage y estado', () => {
    storage.guardarSesion({ token: 'tk', rol: 'ADMIN', id_cuenta: 5 });
    const auth = crearServicio();

    auth.logout();

    expect(auth.estaAutenticado()).toBe(false);
    expect(auth.rol()).toBeNull();
    expect(auth.idCuenta()).toBeNull();
    expect(auth.meListo()).toBe(true);
    expect(storage.obtenerToken()).toBeNull();
    expect(storage.obtenerRol()).toBeNull();
    expect(storage.obtenerIdCuenta()).toBeNull();
  });

  it('rutaPorRol manda a la ruta inicial de cada rol', () => {
    const auth = crearServicio();
    expect(auth.rutaPorRol('ADMIN')).toBe('/admin/panel');
    expect(auth.rutaPorRol('EMPRESA')).toBe('/empresa/panel');
    expect(auth.rutaPorRol('USUARIO')).toBe('/usuario/perfil');
    expect(auth.rutaPorRol(null)).toBe('/');
  });

  it('estaAutenticado refleja la presencia del token en todo momento', () => {
    const auth = crearServicio();
    expect(auth.estaAutenticado()).toBe(false);

    storage.guardarSesion({ token: 'x', rol: 'USUARIO', id_cuenta: 1 });
    expect(auth.estaAutenticado()).toBe(true);

    storage.limpiarSesion();
    expect(auth.estaAutenticado()).toBe(false);
  });
});
