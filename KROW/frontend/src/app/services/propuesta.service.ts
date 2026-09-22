import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { Propuesta } from '../models/Index';
import { MensajeResponse } from '../core/mensaje-response.model';

export interface FiltrosPropuesta {
  tipo?: string;
  modalidad?: string;
  estado?: string;
  empresa_id?: number;
}

export interface PropuestaCreadaResponse {
  id_propuesta: number;
}

@Injectable({ providedIn: 'root' })
export class PropuestaService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}/propuestas`;

  listar(filtros: FiltrosPropuesta = {}): Observable<Propuesta[]> {
    let params = new HttpParams();
    Object.entries(filtros).forEach(([clave, valor]) => {
      if (valor !== undefined && valor !== null && valor !== '') {
        params = params.set(clave, String(valor));
      }
    });
    return this.http.get<Propuesta[]>(this.baseUrl, { params });
  }

  obtenerPorId(id: number): Observable<Propuesta> {
    return this.http.get<Propuesta>(`${this.baseUrl}/${id}`);
  }

  crear(
    empresaId: number,
    data: Omit<Propuesta, 'id_propuesta' | 'fecha_publicacion' | 'estado' | 'empresa_id'>
  ): Observable<PropuestaCreadaResponse> {
    return this.http.post<PropuestaCreadaResponse>(this.baseUrl, { ...data, empresa_id: empresaId });
  }

  actualizar(id: number, data: Partial<Propuesta>): Observable<MensajeResponse> {
    return this.http.put<MensajeResponse>(`${this.baseUrl}/${id}`, data);
  }

  eliminar(id: number): Observable<MensajeResponse> {
    return this.http.delete<MensajeResponse>(`${this.baseUrl}/${id}`);
  }
}