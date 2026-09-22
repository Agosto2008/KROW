import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { environment } from '../../environments/environment';
import { TokenStorageService } from '../core/token-storage.service';
import { Rol, Usuario, Empresa } from '../models/Index';

export interface AuthResponse {
  token: string;
  rol: Rol;
  id_cuenta: number;
}

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

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly tokenStorage = inject(TokenStorageService);
  private readonly baseUrl = `${environment.apiUrl}/auth`;

  private readonly _rolActual = signal<Rol | null>(this.tokenStorage.obtenerRol());
  private readonly _perfilActual = signal<Usuario | Empresa | null>(null);

  readonly rolActual = this._rolActual.asReadonly();
  readonly perfilActual = this._perfilActual.asReadonly();

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

  login(correo: string, password: string): Observable<AuthResponse> {
    return this.http
      .post<AuthResponse>(`${this.baseUrl}/login`, { correo, password })
      .pipe(tap((res) => this.guardarSesion(res)));
  }

  me(): Observable<MeResponse> {
    return this.http.get<MeResponse>(`${this.baseUrl}/me`).pipe(
      tap((res) => {
        this._rolActual.set(res.rol);
        this._perfilActual.set(res.perfil);
      })
    );
  }

  logout(): void {
    this.tokenStorage.limpiarSesion();
    this._rolActual.set(null);
    this._perfilActual.set(null);
  }

  estaAutenticado(): boolean {
    return this.tokenStorage.estaAutenticado();
  }

  private guardarSesion(res: AuthResponse): void {
    this.tokenStorage.guardarSesion(res);
    this._rolActual.set(res.rol);
  }
}