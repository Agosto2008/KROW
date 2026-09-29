import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Mensaje } from '../models/Index';
import { MensajeResponse } from '../mensaje-response.model';

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

  /**
   * El emisor NUNCA va en el body: el backend verifica quién participa
   * realmente en la conversación, así nadie puede suplantar al otro lado.
   */
  enviar(conversacionId: number, contenido: string): Observable<MensajeCreadoResponse> {
    return this.http.post<MensajeCreadoResponse>(this.baseUrl, {
      conversacion_id: conversacionId,
      contenido,
    });
  }

  /** Marca como leídos los mensajes del lado contrario (calculado en el backend) */
  marcarLeidos(conversacionId: number): Observable<MensajeResponse> {
    return this.http.patch<MensajeResponse>(
      `${this.baseUrl}/conversacion/${conversacionId}/leidos`,
      {}
    );
  }
}
