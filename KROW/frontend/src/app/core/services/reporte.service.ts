import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { EstadoReporte, Reporte } from '../models/reporte.model';

@Injectable({ providedIn: 'root' })
export class ReporteService {
    private http = inject(HttpClient);
    private api = `${environment.apiUrl}/reportes`;

    listar(estado?: EstadoReporte): Observable<Reporte[]> {
        let params = new HttpParams();
        if (estado) params = params.set('estado', estado);
        return this.http.get<Reporte[]>(this.api, { params });
    }

    // usuario_id se inyecta desde el token en el backend
    crear(data: { motivo: string; descripcion?: string; empresa_id?: number; propuesta_id?: number }): Observable<{ id_reporte: number }> {
        return this.http.post<{ id_reporte: number }>(this.api, data);
    }

    cambiarEstado(id: number, estado: EstadoReporte): Observable<any> {
        return this.http.patch(`${this.api}/${id}/estado`, { estado });
    }
}