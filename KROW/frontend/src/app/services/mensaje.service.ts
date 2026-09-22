import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { Mensaje, Emisor } from '../models';
import { MensajeResponse } from '../core/mensaje-response.model';

export interface MensajeCreadoResponse {
  id_mensaje: number;
}

@Injectable({ providedIn: 'root' })
export class MensajeService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}/mensajes`;

  listar(conversacionId: number): Observable<Mensaje[]> {
    return this.http.get<Mensaje[]>(`${this.baseUrl}/conversacion/${conversacionId}`);
  }

  enviar(conversacionId: number, emisor: Emisor, contenido: string): Observable<MensajeCreadoResponse> {
    return this.http.post<MensajeCreadoResponse>(this.baseUrl, {
      conversacion_id: conversacionId,
      emisor,
      contenido,
    });
  }

  marcarLeidos(conversacionId: number, emisorContrario: Emisor): Observable<MensajeResponse> {
    return this.http.patch<MensajeResponse>(`${this.baseUrl}/conversacion/${conversacionId}/leidos`, {
      emisor_contrario: emisorContrario,
    });
  }
}