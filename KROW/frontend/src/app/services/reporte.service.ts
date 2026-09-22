import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { Reporte, EstadoReporte } from '../models';
import { MensajeResponse } from '../core/mensaje-response.model';

export interface ReporteCreadaResponse {
  id_reporte: number;
}

@Injectable({ providedIn: 'root' })
export class ReporteService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}/reportes`;

  listar(estado?: EstadoReporte): Observable<Reporte[]> {
    let params = new HttpParams();
    if (estado) params = params.set('estado', estado);
    return this.http.get<Reporte[]>(this.baseUrl, { params });
  }

  crear(data: Pick<Reporte, 'usuario_id' | 'motivo' | 'descripcion'> & Partial<Reporte>): Observable<ReporteCreadaResponse> {
    return this.http.post<ReporteCreadaResponse>(this.baseUrl, data);
  }

  cambiarEstado(id: number, estado: EstadoReporte): Observable<MensajeResponse> {
    return this.http.patch<MensajeResponse>(`${this.baseUrl}/${id}/estado`, { estado });
  }
}