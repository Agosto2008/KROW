import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { CuentaResumen, EstadoCuenta, Rol, Paginado } from '../models/Index';
import { MensajeResponse } from '../mensaje-response.model';

export interface FiltroCuentas {
  buscar?: string;
  rol?: Rol | '';
  estado?: EstadoCuenta | '';
  pagina?: number;
}

@Injectable({ providedIn: 'root' })
export class CuentaService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}/cuentas`;

  /** Listado para el ADMIN con búsqueda, filtros y paginación en el servidor */
  listar(filtros: FiltroCuentas = {}): Observable<Paginado<CuentaResumen>> {
    let params = new HttpParams();
    Object.entries(filtros).forEach(([clave, valor]) => {
      if (valor !== undefined && valor !== null && valor !== '') {
        params = params.set(clave, String(valor));
      }
    });
    return this.http.get<Paginado<CuentaResumen>>(this.baseUrl, { params });
  }

  cambiarEstado(id: number, estado: EstadoCuenta): Observable<MensajeResponse> {
    return this.http.patch<MensajeResponse>(`${this.baseUrl}/${id}/estado`, { estado });
  }
}
