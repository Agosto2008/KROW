import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Notificacion } from '../models/Index';
import { MensajeResponse } from '../mensaje-response.model';

/**
 * Notificaciones por TOKEN: no se manda ningún id, la cuenta sale del JWT.
 * Así nadie puede leer las notificaciones de otra cuenta.
 */
@Injectable({ providedIn: 'root' })
export class NotificacionService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}/notificaciones`;

  listar(): Observable<Notificacion[]> {
    return this.http.get<Notificacion[]>(this.baseUrl);
  }

  /** Contador de la campana del navbar */
  contarNoLeidas(): Observable<{ total: number }> {
    return this.http.get<{ total: number }>(`${this.baseUrl}/no-leidas`);
  }

  marcarLeida(id: number): Observable<MensajeResponse> {
    return this.http.patch<MensajeResponse>(`${this.baseUrl}/${id}/leida`, {});
  }

  marcarTodasLeidas(): Observable<MensajeResponse> {
    return this.http.patch<MensajeResponse>(`${this.baseUrl}/leidas`, {});
  }
}
