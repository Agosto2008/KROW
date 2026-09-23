import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Notificacion } from '../models/notificacion.model';

@Injectable({ providedIn: 'root' })
export class NotificacionService {
    private http = inject(HttpClient);
    private api = `${environment.apiUrl}/notificaciones`;

    listar(usuarioId: number): Observable<Notificacion[]> {
        return this.http.get<Notificacion[]>(`${this.api}/usuario/${usuarioId}`);
    }

    marcarLeida(id: number): Observable<any> {
        return this.http.patch(`${this.api}/${id}/leida`, {});
    }

    marcarTodasLeidas(usuarioId: number): Observable<any> {
        return this.http.patch(`${this.api}/usuario/${usuarioId}/leidas`, {});
    }
}