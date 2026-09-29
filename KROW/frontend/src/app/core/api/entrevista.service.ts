import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import {
  Entrevista,
  EntrevistaConPropuesta,
  EntrevistaConCandidato,
  EstadoEntrevista,
} from '../models/Index';
import { MensajeResponse } from '../mensaje-response.model';

export interface EntrevistaCreadaResponse {
  id_entrevista: number;
}

@Injectable({ providedIn: 'root' })
export class EntrevistaService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}/entrevistas`;

  /** Mis entrevistas con oferta + empresa (1 query) */
  listarPorUsuario(usuarioId: number): Observable<EntrevistaConPropuesta[]> {
    return this.http.get<EntrevistaConPropuesta[]>(`${this.baseUrl}/usuario/${usuarioId}`);
  }

  /** Entrevistas de MIS ofertas con el candidato (1 query) */
  listarPorEmpresa(empresaId: number): Observable<EntrevistaConCandidato[]> {
    return this.http.get<EntrevistaConCandidato[]>(`${this.baseUrl}/empresa/${empresaId}`);
  }

  listarPorSolicitud(solicitudId: number): Observable<Entrevista[]> {
    return this.http.get<Entrevista[]>(`${this.baseUrl}/solicitud/${solicitudId}`);
  }

  programar(data: Omit<Entrevista, 'id_entrevista' | 'estado'>): Observable<EntrevistaCreadaResponse> {
    return this.http.post<EntrevistaCreadaResponse>(this.baseUrl, data);
  }

  reprogramar(id: number, data: Partial<Entrevista>): Observable<MensajeResponse> {
    return this.http.put<MensajeResponse>(`${this.baseUrl}/${id}/reprogramar`, data);
  }

  cambiarEstado(id: number, estado: EstadoEntrevista): Observable<MensajeResponse> {
    return this.http.patch<MensajeResponse>(`${this.baseUrl}/${id}/estado`, { estado });
  }
}
