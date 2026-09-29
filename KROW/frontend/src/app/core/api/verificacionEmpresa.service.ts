import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import {
  VerificacionEmpresa,
  TipoVerificacion,
  EstadoVerificacion,
} from '../models/Index';
import { MensajeResponse } from '../mensaje-response.model';

export interface VerificacionCreadaResponse {
  id_verificacion: number;
}

/**
 * Verificación con el nombre/foto/estado de la empresa ya resueltos
 * (el JOIN lo hace el backend en 1 query).
 */
export interface VerificacionConEmpresa extends VerificacionEmpresa {
  empresa_nombre: string;
  empresa_fotografia?: string | null;
  empresa_ubicacion?: string | null;
  verificada: boolean;
}

@Injectable({ providedIn: 'root' })
export class VerificacionEmpresaService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}/verificaciones-empresa`;

  /** Cola del ADMIN: todas (o filtradas con ?estado=PENDIENTE) */
  listarTodas(estado?: EstadoVerificacion | ''): Observable<VerificacionConEmpresa[]> {
    let url = this.baseUrl;
    if (estado) url += `?estado=${estado}`;
    return this.http.get<VerificacionConEmpresa[]>(url);
  }

  /** Historial de una empresa (la propia empresa o un ADMIN) */
  listarPorEmpresa(empresaId: number): Observable<VerificacionEmpresa[]> {
    return this.http.get<VerificacionEmpresa[]>(`${this.baseUrl}/empresa/${empresaId}`);
  }

  /** La empresa sale del token: no hay que mandar empresa_id */
  solicitar(tipoVerificacion: TipoVerificacion): Observable<VerificacionCreadaResponse> {
    return this.http.post<VerificacionCreadaResponse>(this.baseUrl, {
      tipo_verificacion: tipoVerificacion,
    });
  }

  /**
   * Resuelve una solicitud (solo ADMIN). El administrador y la empresa
   * los toma el backend del token y del registro.
   */
  resolver(
    id: number,
    estado: Extract<EstadoVerificacion, 'APROBADA' | 'RECHAZADA'>,
    observacion?: string
  ): Observable<MensajeResponse> {
    return this.http.patch<MensajeResponse>(`${this.baseUrl}/${id}/resolver`, {
      estado,
      observacion,
    });
  }
}
