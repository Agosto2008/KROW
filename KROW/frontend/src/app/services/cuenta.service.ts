import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { Cuenta, EstadoCuenta } from '../models/Index';
import { MensajeResponse } from '../core/mensaje-response.model';

@Injectable({ providedIn: 'root' })
export class CuentaService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}/cuentas`;

  obtenerPorId(id: number): Observable<Cuenta> {
    return this.http.get<Cuenta>(`${this.baseUrl}/${id}`);
  }

  cambiarEstado(id: number, estado: EstadoCuenta): Observable<MensajeResponse> {
    return this.http.patch<MensajeResponse>(`${this.baseUrl}/${id}/estado`, { estado });
  }
}