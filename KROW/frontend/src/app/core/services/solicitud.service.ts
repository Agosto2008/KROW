import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { EstadoSolicitud, Solicitud } from '../models/solicitud.model';

@Injectable({ providedIn: 'root' })
export class SolicitudService {
    private http = inject(HttpClient);
    private api = `${environment.apiUrl}/solicitudes`;

    listarPorUsuario(usuarioId: number): Observable<Solicitud[]> {
        return this.http.get<Solicitud[]>(`${this.api}/usuario/${usuarioId}`);
    }

    listarPorPropuesta(propuestaId: number): Observable<Solicitud[]> {
        return this.http.get<Solicitud[]>(`${this.api}/propuesta/${propuestaId}`);
    }

    // usuario_id se deriva del token en el backend
    aplicar(propuestaId: number): Observable<{ id_solicitud: number }> {
        return this.http.post<{ id_solicitud: number }>(this.api, { propuesta_id: propuestaId });
    }

    cambiarEstado(id: number, estado: EstadoSolicitud, comentarioEmpresa?: string): Observable<any> {
        return this.http.patch(`${this.api}/${id}/estado`, { estado, comentario_empresa: comentarioEmpresa });
    }
}