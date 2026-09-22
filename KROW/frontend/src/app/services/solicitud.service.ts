import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { Solicitud, EstadoSolicitud } from '../models/Index';
import { MensajeResponse } from '../core/mensaje-response.model';

export interface SolicitudCreadaResponse {
  id_solicitud: number;
}

@Injectable({ providedIn: 'root' })
export class SolicitudService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}/solicitudes`;

  listarPorUsuario(usuarioId: number): Observable<Solicitud[]> {
    return this.http.get<Solicitud[]>(`${this.baseUrl}/usuario/${usuarioId}`);
  }

  listarPorPropuesta(propuestaId: number): Observable<Solicitud[]> {
    return this.http.get<Solicitud[]>(`${this.baseUrl}/propuesta/${propuestaId}`);
  }

  aplicar(usuarioId: number, propuestaId: number): Observable<SolicitudCreadaResponse> {
    return this.http.post<SolicitudCreadaResponse>(this.baseUrl, {
      usuario_id: usuarioId,
      propuesta_id: propuestaId,
    });
  }

  cambiarEstado(id: number, estado: EstadoSolicitud, comentarioEmpresa?: string): Observable<MensajeResponse> {
    return this.http.patch<MensajeResponse>(`${this.baseUrl}/${id}/estado`, {
      estado,
      comentario_empresa: comentarioEmpresa,
    });
  }
}