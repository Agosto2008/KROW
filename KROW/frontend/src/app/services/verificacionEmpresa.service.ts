import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { VerificacionEmpresa, TipoVerificacion, EstadoVerificacion } from '../models';
import { MensajeResponse } from '../core/mensaje-response.model';

export interface VerificacionCreadaResponse {
  id_verificacion: number;
}

@Injectable({ providedIn: 'root' })
export class VerificacionEmpresaService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}/verificaciones-empresa`;

  listarPorEmpresa(empresaId: number): Observable<VerificacionEmpresa[]> {
    return this.http.get<VerificacionEmpresa[]>(`${this.baseUrl}/empresa/${empresaId}`);
  }

  solicitar(empresaId: number, tipoVerificacion: TipoVerificacion): Observable<VerificacionCreadaResponse> {
    return this.http.post<VerificacionCreadaResponse>(this.baseUrl, {
      empresa_id: empresaId,
      tipo_verificacion: tipoVerificacion,
    });
  }

  resolver(
    id: number,
    empresaId: number,
    estado: EstadoVerificacion,
    administrador: string,
    observacion?: string
  ): Observable<MensajeResponse> {
    return this.http.patch<MensajeResponse>(`${this.baseUrl}/${id}/resolver`, {
      empresa_id: empresaId,
      estado,
      administrador,
      observacion,
    });
  }
}