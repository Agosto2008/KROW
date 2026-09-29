import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Empresa, EmpresaConPropuestas, Paginado } from '../models/Index';
import { MensajeResponse } from '../mensaje-response.model';

export interface FiltroEmpresas {
  buscar?: string;
  verificadas?: boolean;
  pagina?: number;
  por_pagina?: number;
}

@Injectable({ providedIn: 'root' })
export class EmpresaService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}/empresas`;

  /** Sin parámetros → lista plana (para selects auxiliares) */
  listar(): Observable<Empresa[]> {
    return this.http.get<Empresa[]>(this.baseUrl);
  }

  /** Con buscar/pagina → página en el servidor */
  buscar(filtros: FiltroEmpresas = {}): Observable<Paginado<Empresa>> {
    let params = new HttpParams().set('pagina', String(filtros.pagina ?? 1));
    if (filtros.buscar) params = params.set('buscar', filtros.buscar);
    if (filtros.verificadas) params = params.set('verificadas', 'true');
    if (filtros.por_pagina) params = params.set('por_pagina', String(filtros.por_pagina));
    return this.http.get<Paginado<Empresa>>(this.baseUrl, { params });
  }

  obtenerPorId(id: number): Observable<Empresa> {
    return this.http.get<Empresa>(`${this.baseUrl}/${id}`);
  }

  /** Empresa + sus ofertas activas en 1 query (vista pública) */
  obtenerConPropuestas(id: number): Observable<EmpresaConPropuestas> {
    return this.http.get<EmpresaConPropuestas>(`${this.baseUrl}/${id}/con-propuestas`);
  }

  actualizar(id: number, data: Partial<Empresa>): Observable<MensajeResponse> {
    return this.http.put<MensajeResponse>(`${this.baseUrl}/${id}`, data);
  }
}
