import { Injectable } from '@angular/core';
import { STORAGE_KEYS } from './config/storage-keys';
import { Rol } from './models/Index';

export interface SesionGuardada {
  token: string;
  rol: Rol;
  id_cuenta: number;
}

/**
 * Guarda la sesión en localStorage.
 * SPA pura (sin SSR): no hace falta comprobar la plataforma.
 */
@Injectable({ providedIn: 'root' })
export class TokenStorageService {
  guardarSesion(sesion: SesionGuardada): void {
    localStorage.setItem(STORAGE_KEYS.TOKEN, sesion.token);
    localStorage.setItem(STORAGE_KEYS.ROL, sesion.rol);
    localStorage.setItem(STORAGE_KEYS.ID_CUENTA, String(sesion.id_cuenta));
  }

  /** Actualiza solo el rol (p.ej. cuando /auth/me lo certifica) */
  guardarRol(rol: Rol): void {
    localStorage.setItem(STORAGE_KEYS.ROL, rol);
  }

  obtenerToken(): string | null {
    return localStorage.getItem(STORAGE_KEYS.TOKEN);
  }

  obtenerRol(): Rol | null {
    return localStorage.getItem(STORAGE_KEYS.ROL) as Rol | null;
  }

  obtenerIdCuenta(): number | null {
    const valor = localStorage.getItem(STORAGE_KEYS.ID_CUENTA);
    return valor ? Number(valor) : null;
  }

  estaAutenticado(): boolean {
    return !!this.obtenerToken();
  }

  limpiarSesion(): void {
    localStorage.removeItem(STORAGE_KEYS.TOKEN);
    localStorage.removeItem(STORAGE_KEYS.ROL);
    localStorage.removeItem(STORAGE_KEYS.ID_CUENTA);
  }
}
