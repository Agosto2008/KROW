import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { Entrevista, EstadoEntrevista } from '../models/Index';
import { MensajeResponse } from '../core/mensaje-response.model';

export interface EntrevistaCreadaResponse {
  id_entrevista: number;
}

@Injectable({ providedIn: 'root' })
export class EntrevistaService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}/entrevistas`;

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