import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Propuesta, PropuestaConEmpresa, Paginado } from '../models/Index';
import { MensajeResponse } from '../mensaje-response.model';

export interface FiltrosPropuesta {
  tipo?: string;
  modalidad?: string;
  estado?: string;
  empresa_id?: number;
  /** Búsqueda de texto → el backend pagina en el servidor */
  buscar?: string;
  pagina?: number;
  por_pagina?: number;
}

export interface PropuestaCreadaResponse {
  id_propuesta: number;
}

@Injectable({ providedIn: 'root' })
export class PropuestaService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}/propuestas`;

  private aParams(filtros: FiltrosPropuesta): HttpParams {
    let params = new HttpParams();
    Object.entries(filtros).forEach(([clave, valor]) => {
      if (valor !== undefined && valor !== null && valor !== '') {
        params = params.set(clave, String(valor));
      }
    });
    return params;
  }

  /**
   * Listado paginado con búsqueda en el servidor.
   * Cada fila ya trae su empresa embebida (sin N+1).
   *
   * `pagina` se envía SIEMPRE (igual que EmpresaService.buscar): el backend
   * solo activa la paginación ({datos,total,...}) si recibe `pagina` o
   * `buscar`; sin ella devolvía una lista plana y `res.datos` era undefined.
   */
  buscar(filtros: FiltrosPropuesta = {}): Observable<Paginado<PropuestaConEmpresa>> {
    return this.http.get<Paginado<PropuestaConEmpresa>>(this.baseUrl, {
      params: this.aParams({ estado: 'ACTIVA', ...filtros, pagina: filtros.pagina ?? 1 }),
    });
  }

  /** Detalle: propuesta + ficha de empresa en UNA petición */
  obtenerPorId(id: number): Observable<PropuestaConEmpresa> {
    return this.http.get<PropuestaConEmpresa>(`${this.baseUrl}/${id}`);
  }

  /** El empresa_id NUNCA va en el body: lo deriva el backend del token */
  crear(
    data: Omit<Propuesta, 'id_propuesta' | 'fecha_publicacion' | 'estado' | 'empresa_id'>
  ): Observable<PropuestaCreadaResponse> {
    return this.http.post<PropuestaCreadaResponse>(this.baseUrl, data);
  }

  actualizar(id: number, data: Partial<Propuesta>): Observable<MensajeResponse> {
    return this.http.put<MensajeResponse>(`${this.baseUrl}/${id}`, data);
  }

  eliminar(id: number): Observable<MensajeResponse> {
    return this.http.delete<MensajeResponse>(`${this.baseUrl}/${id}`);
  }
}
