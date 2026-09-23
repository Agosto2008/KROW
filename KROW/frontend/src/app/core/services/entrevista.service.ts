import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Entrevista, EstadoEntrevista } from '../models/entrevista.model';

@Injectable({ providedIn: 'root' })
export class EntrevistaService {
    private http = inject(HttpClient);
    private api = `${environment.apiUrl}/entrevistas`;

    listarPorSolicitud(solicitudId: number): Observable<Entrevista[]> {
        return this.http.get<Entrevista[]>(`${this.api}/solicitud/${solicitudId}`);
    }

    programar(data: Omit<Entrevista, 'id_entrevista' | 'estado'>): Observable<{ id_entrevista: number }> {
        return this.http.post<{ id_entrevista: number }>(this.api, data);
    }

    reprogramar(id: number, data: Partial<Entrevista>): Observable<any> {
        return this.http.put(`${this.api}/${id}/reprogramar`, data);
    }

    cambiarEstado(id: number, estado: EstadoEntrevista): Observable<any> {
        return this.http.patch(`${this.api}/${id}/estado`, { estado });
    }
}