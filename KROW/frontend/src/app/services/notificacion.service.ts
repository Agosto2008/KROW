import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { Notificacion } from '../models/Index';
import { MensajeResponse } from '../core/mensaje-response.model';

@Injectable({ providedIn: 'root' })
export class NotificacionService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}/notificaciones`;

  listar(usuarioId: number): Observable<Notificacion[]> {
    return this.http.get<Notificacion[]>(`${this.baseUrl}/usuario/${usuarioId}`);
  }

  marcarLeida(id: number): Observable<MensajeResponse> {
    return this.http.patch<MensajeResponse>(`${this.baseUrl}/${id}/leida`, {});
  }

  marcarTodasLeidas(usuarioId: number): Observable<MensajeResponse> {
    return this.http.patch<MensajeResponse>(`${this.baseUrl}/usuario/${usuarioId}/leidas`, {});
  }
}