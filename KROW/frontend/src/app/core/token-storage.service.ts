import { Injectable, PLATFORM_ID, inject } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { STORAGE_KEYS } from '../config/storage-keys';
import { Rol } from '../models/Index';

export interface SesionGuardada {
  token: string;
  rol: Rol;
  id_cuenta: number;
}

@Injectable({ providedIn: 'root' })
export class TokenStorageService {
  // Proyecto con SSR: localStorage no existe en servidor, hay que verificar plataforma
  private readonly isBrowser = isPlatformBrowser(inject(PLATFORM_ID));

  guardarSesion(sesion: SesionGuardada): void {
    if (!this.isBrowser) return;
    localStorage.setItem(STORAGE_KEYS.TOKEN, sesion.token);
    localStorage.setItem(STORAGE_KEYS.ROL, sesion.rol);
    localStorage.setItem(STORAGE_KEYS.ID_CUENTA, String(sesion.id_cuenta));
  }

  obtenerToken(): string | null {
    return this.isBrowser ? localStorage.getItem(STORAGE_KEYS.TOKEN) : null;
  }

  obtenerRol(): Rol | null {
    return this.isBrowser ? (localStorage.getItem(STORAGE_KEYS.ROL) as Rol | null) : null;
  }

  obtenerIdCuenta(): number | null {
    if (!this.isBrowser) return null;
    const valor = localStorage.getItem(STORAGE_KEYS.ID_CUENTA);
    return valor ? Number(valor) : null;
  }

  estaAutenticado(): boolean {
    return !!this.obtenerToken();
  }

  limpiarSesion(): void {
    if (!this.isBrowser) return;
    localStorage.removeItem(STORAGE_KEYS.TOKEN);
    localStorage.removeItem(STORAGE_KEYS.ROL);
    localStorage.removeItem(STORAGE_KEYS.ID_CUENTA);
  }
}