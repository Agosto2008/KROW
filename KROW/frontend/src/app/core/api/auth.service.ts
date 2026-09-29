import { Injectable, inject, signal, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap, finalize } from 'rxjs';
import { environment } from '../../../environments/environment';
import { TokenStorageService } from '../token-storage.service';
import { Rol, Usuario, Empresa } from '../models/Index';
 
export interface AuthResponse {
  token: string;
  rol: Rol;
  id_cuenta: number;
}
 
/** Respuesta de GET /auth/me */
export interface MeResponse {
  rol: Rol;
  perfil: Usuario | Empresa | null;
}
 
export interface RegistroUsuarioDto {
  correo: string;
  password: string;
  primer_nombre: string;
  primer_apellido: string;
  segundo_nombre?: string;
  segundo_apellido?: string;
  telefono?: string;
}
 
export interface RegistroEmpresaDto {
  correo: string;
  password: string;
  nombre: string;
  descripcion?: string;
  telefono?: string;
  ubicacion?: string;
}
 
/**
 * Fuente de verdad UNICA de la sesion.
 *
 * Guarda siempre tres cosas juntas: id_cuenta, rol e id de perfil
 * (id_usuario o id_empresa), las tres obtenidas de /auth/me. Asi
 * desaparece el bug "id_cuenta == id_usuario" que rompia 7 pantallas.
 */
@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly tokenStorage = inject(TokenStorageService);
  private readonly baseUrl = `${environment.apiUrl}/auth`;
 
  // estado de la sesion (nada mas leer de localStorage: se refresca con /me)
  // _autenticado es un signal de verdad: un computed(() => storage.esta...)
  // queda CONGELADO en su primer valor (localStorage no es reactivo) y el
  // navbar dejaba de reflejar el login/logout. Se actualiza en guardarSesion
  // (true) y en limpiarEstado/logout (false), incluido el 401 del interceptor.
  private readonly _autenticado = signal<boolean>(this.tokenStorage.estaAutenticado());
  private readonly _rol = signal<Rol | null>(this.tokenStorage.obtenerRol());
  private readonly _idCuenta = signal<number | null>(this.tokenStorage.obtenerIdCuenta());
  private readonly _perfil = signal<Usuario | Empresa | null>(null);
  private readonly _cargandoMe = signal(false);
  private readonly _meListo = signal(false);
 
  readonly rol = this._rol.asReadonly();
  readonly idCuenta = this._idCuenta.asReadonly();
  readonly perfil = this._perfil.asReadonly();
  readonly cargandoMe = this._cargandoMe.asReadonly();
  readonly meListo = this._meListo.asReadonly();
 
  readonly autenticado = this._autenticado.asReadonly();
 
  /** id de perfil segun rol: NUNCA confundir id_cuenta con id_usuario */
  readonly idUsuario = computed<number | null>(() => {
    const p = this._perfil();
    return this._rol() === 'USUARIO' && p ? (p as Usuario).id_usuario : null;
  });
 
  readonly idEmpresa = computed<number | null>(() => {
    const p = this._perfil();
    return this._rol() === 'EMPRESA' && p ? (p as Empresa).id_empresa : null;
  });
 
  /** nombre para mostrar en navbar/saludos */
  readonly nombreVisible = computed(() => {
    const p = this._perfil();
    if (!p) return this._rol() ?? '';
    if (this._rol() === 'USUARIO') {
      const u = p as Usuario;
      return [u.primer_nombre, u.primer_apellido].filter(Boolean).join(' ') || 'Tu perfil';
    }
    return (p as Empresa).nombre || 'Tu empresa';
  });
 
  // ============================================================
  // Sesión
  // ============================================================
 
  /**
   * Refresca el perfil desde el servidor. Se llama al arrancar la app
   * (si hay token guardado) y tras cada login/registro.
   */
  cargarSesion(): Observable<MeResponse | null> {
    if (!this.autenticado()) {
      this.limpiarEstado();
      this._meListo.set(true);
      return new Observable<null>((obs) => { obs.next(null); obs.complete(); });
    }
 
    this._cargandoMe.set(true);
    return this.http.get<MeResponse>(`${this.baseUrl}/me`).pipe(
      tap((res) => {
        this._rol.set(res.rol);
        this._perfil.set(res.perfil);
        // el rol real lo certifica el servidor: se re-sincroniza el storage
        this.tokenStorage.guardarRol(res.rol);
      }),
      finalize(() => {
        this._cargandoMe.set(false);
        this._meListo.set(true);
      })
    );
  }
 
  login(correo: string, password: string): Observable<AuthResponse> {
    return this.http
      .post<AuthResponse>(`${this.baseUrl}/login`, { correo, password })
      .pipe(tap((res) => this.guardarSesion(res)));
  }
 
  registrarUsuario(data: RegistroUsuarioDto): Observable<AuthResponse> {
    return this.http
      .post<AuthResponse>(`${this.baseUrl}/registro/usuario`, data)
      .pipe(tap((res) => this.guardarSesion(res)));
  }
 
  registrarEmpresa(data: RegistroEmpresaDto): Observable<AuthResponse> {
    return this.http
      .post<AuthResponse>(`${this.baseUrl}/registro/empresa`, data)
      .pipe(tap((res) => this.guardarSesion(res)));
  }
 
  /** Cambia la contraseña de la cuenta autenticada (exige la actual) */
  cambiarPassword(passwordActual: string, passwordNueva: string): Observable<{ mensaje: string }> {
    return this.http.post<{ mensaje: string }>(`${this.baseUrl}/cambiar-password`, {
      password_actual: passwordActual,
      password_nueva: passwordNueva,
    });
  }
 
  logout(): void {
    this.tokenStorage.limpiarSesion();
    this.limpiarEstado();
    this._meListo.set(true);
  }
 
  estaAutenticado(): boolean {
    return this.tokenStorage.estaAutenticado();
  }
 
  // ============================================================
  // Internos
  // ============================================================
 
  private guardarSesion(res: AuthResponse): void {
    this.tokenStorage.guardarSesion(res);
    this._autenticado.set(true);
    this._rol.set(res.rol);
    this._idCuenta.set(res.id_cuenta);
    // el perfil llega en la llamada a /me que hace la pagina de login
    this._meListo.set(false);
  }
 
  private limpiarEstado(): void {
    this._autenticado.set(false);
    this._rol.set(null);
    this._idCuenta.set(null);
    this._perfil.set(null);
  }
 
  /** Ruta por defecto a la que manda cada rol tras entrar */
  rutaPorRol(rol: Rol | null): string {
    switch (rol) {
      case 'ADMIN': return '/admin/panel';
      case 'EMPRESA': return '/empresa/panel';
      case 'USUARIO': return '/usuario/perfil';
      default: return '/';
    }
  }
}
 