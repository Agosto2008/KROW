import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Conversacion } from '../models/conversacion.model';

@Injectable({ providedIn: 'root' })
export class ConversacionService {
    private http = inject(HttpClient);
    private api = `${environment.apiUrl}/conversaciones`;

    obtenerPorSolicitud(solicitudId: number): Observable<Conversacion> {
        return this.http.get<Conversacion>(`${this.api}/solicitud/${solicitudId}`);
    }

    cerrar(id: number): Observable<any> {
        return this.http.patch(`${this.api}/${id}/cerrar`, {});
    }
}