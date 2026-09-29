import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import {
  Solicitud,
  SolicitudConPropuesta,
  SolicitudConCandidato,
  EstadoSolicitud,
} from '../models/Index';
import { MensajeResponse } from '../mensaje-response.model';

export interface SolicitudCreadaResponse {
  id_solicitud: number;
}

@Injectable({ providedIn: 'root' })
export class SolicitudService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}/solicitudes`;

  /** Mis postulaciones con oferta + empresa resueltas (1 query) */
  listarPorUsuario(usuarioId: number): Observable<SolicitudConPropuesta[]> {
    return this.http.get<SolicitudConPropuesta[]>(`${this.baseUrl}/usuario/${usuarioId}`);
  }

  /** Postulaciones a MIS ofertas con el candidato resuelto (1 query) */
  listarPorEmpresa(empresaId: number): Observable<SolicitudConCandidato[]> {
    return this.http.get<SolicitudConCandidato[]>(`${this.baseUrl}/empresa/${empresaId}`);
  }

  listarPorPropuesta(propuestaId: number): Observable<Solicitud[]> {
    return this.http.get<Solicitud[]>(`${this.baseUrl}/propuesta/${propuestaId}`);
  }

  /** El usuario_id NUNCA va en el body: lo deriva el backend del token */
  aplicar(propuestaId: number): Observable<SolicitudCreadaResponse> {
    return this.http.post<SolicitudCreadaResponse>(this.baseUrl, {
      propuesta_id: propuestaId,
    });
  }

  cambiarEstado(
    id: number,
    estado: EstadoSolicitud,
    comentarioEmpresa?: string
  ): Observable<MensajeResponse> {
    return this.http.patch<MensajeResponse>(`${this.baseUrl}/${id}/estado`, {
      estado,
      comentario_empresa: comentarioEmpresa,
    });
  }
}
