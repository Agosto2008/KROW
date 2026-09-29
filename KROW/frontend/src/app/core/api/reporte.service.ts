import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Reporte, EstadoReporte, MotivoReporte } from '../models/Index';
import { MensajeResponse } from '../mensaje-response.model';

export interface ReporteCreadaResponse {
  id_reporte: number;
}

/** Lo que el candidato envía: el usuario_id lo deriva el backend del token */
export interface ReporteNuevo {
  motivo: MotivoReporte | string;
  descripcion?: string;
  propuesta_id?: number;
  empresa_id?: number;
}

@Injectable({ providedIn: 'root' })
export class ReporteService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}/reportes`;

  listar(estado?: EstadoReporte): Observable<Reporte[]> {
    const url = estado ? `${this.baseUrl}?estado=${estado}` : this.baseUrl;
    return this.http.get<Reporte[]>(url);
  }

  crear(data: ReporteNuevo): Observable<ReporteCreadaResponse> {
    return this.http.post<ReporteCreadaResponse>(this.baseUrl, data);
  }

  cambiarEstado(id: number, estado: EstadoReporte): Observable<MensajeResponse> {
    return this.http.patch<MensajeResponse>(`${this.baseUrl}/${id}/estado`, { estado });
  }
}
