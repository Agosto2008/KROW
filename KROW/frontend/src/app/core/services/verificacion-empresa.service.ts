import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { EstadoVerificacion, TipoVerificacion, VerificacionEmpresa } from '../models/verificacion-empresa.model';

@Injectable({ providedIn: 'root' })
export class VerificacionEmpresaService {
    private http = inject(HttpClient);
    private api = `${environment.apiUrl}/verificaciones-empresa`;

    listarPorEmpresa(empresaId: number): Observable<VerificacionEmpresa[]> {
        return this.http.get<VerificacionEmpresa[]>(`${this.api}/empresa/${empresaId}`);
    }

    solicitar(tipo: TipoVerificacion): Observable<{ id_verificacion: number }> {
        return this.http.post<{ id_verificacion: number }>(this.api, { tipo_verificacion: tipo });
    }

    resolver(id: number, estado: EstadoVerificacion, observacion?: string): Observable<any> {
        return this.http.patch(`${this.api}/${id}/resolver`, { estado, observacion });
    }
}