import { Injectable, signal } from '@angular/core';

export type TipoToast = 'exito' | 'error' | 'info' | 'alerta';

export interface Toast {
  id: number;
  tipo: TipoToast;
  mensaje: string;
}

@Injectable({ providedIn: 'root' })
export class ToastService {
  private readonly _toasts = signal<Toast[]>([]);
  readonly toasts = this._toasts.asReadonly();

  private contador = 0;

  mostrar(mensaje: string, tipo: TipoToast = 'info', duracionMs = 3500): void {
    const id = ++this.contador;
    this._toasts.update((lista) => [...lista, { id, tipo, mensaje }]);
    setTimeout(() => this.cerrar(id), duracionMs);
  }

  exito(mensaje: string): void { this.mostrar(mensaje, 'exito'); }
  error(mensaje: string): void { this.mostrar(mensaje, 'error'); }
  info(mensaje: string): void  { this.mostrar(mensaje, 'info'); }
  alerta(mensaje: string): void { this.mostrar(mensaje, 'alerta'); }

  cerrar(id: number): void {
    this._toasts.update((lista) => lista.filter((t) => t.id !== id));
  }
}