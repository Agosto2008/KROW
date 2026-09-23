import { HttpClient } from '@angular/common/http';
import { Injectable, computed, inject, signal } from '@angular/core';
import { Observable, tap } from 'rxjs';
import { environment } from '../../../environments/environment';
import { LoginResponse, RolCuenta } from '../models/cuenta.model';

const TOKEN_KEY = 'krow_token';
const ROL_KEY = 'krow_rol';
const ID_KEY = 'krow_id_cuenta';

interface PerfilResponse {
    rol: RolCuenta;
    perfil: any | null;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
    private http = inject(HttpClient);
    private api = `${environment.apiUrl}/auth`;

    // Signal con el rol actual: cualquier componente puede reaccionar al cambio
    private _rol = signal<RolCuenta | null>(localStorage.getItem(ROL_KEY) as RolCuenta | null);
    readonly rol = computed(() => this._rol());
    readonly estaLogueado = computed(() => !!localStorage.getItem(TOKEN_KEY));

    login(correo: string, password: string): Observable<LoginResponse> {
        return this.http.post<LoginResponse>(`${this.api}/login`, { correo, password })
            .pipe(tap(res => this.guardarSesion(res)));
    }

    registrarUsuario(data: any): Observable<LoginResponse> {
        return this.http.post<LoginResponse>(`${this.api}/registro/usuario`, data)
            .pipe(tap(res => this.guardarSesion(res)));
    }

    registrarEmpresa(data: any): Observable<LoginResponse> {
        return this.http.post<LoginResponse>(`${this.api}/registro/empresa`, data)
            .pipe(tap(res => this.guardarSesion(res)));
    }

    // Devuelve { rol, perfil } de la cuenta autenticada
    me(): Observable<PerfilResponse> {
        return this.http.get<PerfilResponse>(`${this.api}/me`);
    }

    cerrarSesion(): void {
        localStorage.removeItem(TOKEN_KEY);
        localStorage.removeItem(ROL_KEY);
        localStorage.removeItem(ID_KEY);
        this._rol.set(null);
    }

    private guardarSesion(res: LoginResponse) {
        localStorage.setItem(TOKEN_KEY, res.token);
        localStorage.setItem(ROL_KEY, res.rol);
        localStorage.setItem(ID_KEY, String(res.id_cuenta));
        this._rol.set(res.rol);
    }
}