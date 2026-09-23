import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Conversacion, ConversacionResumen } from '../models/Index';
import { MensajeResponse } from '../mensaje-response.model';

@Injectable({ providedIn: 'root' })
export class ConversacionService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}/conversaciones`;

  /**
   * Sidebar de chats de la cuenta autenticada (por token): el otro lado,
   * la oferta, el último mensaje y los no leídos en 1 sola query.
   */
  listarPropias(): Observable<ConversacionResumen[]> {
    return this.http.get<ConversacionResumen[]>(this.baseUrl);
  }

  obtenerPorSolicitud(solicitudId: number): Observable<Conversacion> {
    return this.http.get<Conversacion>(`${this.baseUrl}/solicitud/${solicitudId}`);
  }

  cerrar(id: number): Observable<MensajeResponse> {
    return this.http.patch<MensajeResponse>(`${this.baseUrl}/${id}/cerrar`, {});
  }
}
