import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { Conversacion } from '../models';
import { MensajeResponse } from '../core/mensaje-response.model';

@Injectable({ providedIn: 'root' })
export class ConversacionService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}/conversaciones`;

  obtenerPorSolicitud(solicitudId: number): Observable<Conversacion> {
    return this.http.get<Conversacion>(`${this.baseUrl}/solicitud/${solicitudId}`);
  }

  cerrar(id: number): Observable<MensajeResponse> {
    return this.http.patch<MensajeResponse>(`${this.baseUrl}/${id}/cerrar`, {});
  }
}
