import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Mensaje } from '../models/mensaje.model';

@Injectable({ providedIn: 'root' })
export class MensajeService {
    private http = inject(HttpClient);
    private api = `${environment.apiUrl}/mensajes`;

    listar(conversacionId: number): Observable<Mensaje[]> {
        return this.http.get<Mensaje[]>(`${this.api}/conversacion/${conversacionId}`);
    }

    // El backend calcula el emisor según el rol del token
    enviar(conversacionId: number, contenido: string): Observable<{ id_mensaje: number }> {
        return this.http.post<{ id_mensaje: number }>(this.api, { conversacion_id: conversacionId, contenido });
    }

    marcarLeidos(conversacionId: number): Observable<any> {
        return this.http.patch(`${this.api}/conversacion/${conversacionId}/leidos`, {});
    }
}