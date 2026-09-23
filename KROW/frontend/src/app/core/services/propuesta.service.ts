import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Propuesta } from '../models/propuesta.model';

@Injectable({ providedIn: 'root' })
export class PropuestaService {
    private http = inject(HttpClient);
    private api = `${environment.apiUrl}/propuestas`;

    listar(filtros: Record<string, string> = {}): Observable<Propuesta[]> {
        let params = new HttpParams();
        Object.entries(filtros).forEach(([k, v]) => { if (v) params = params.set(k, v); });
        return this.http.get<Propuesta[]>(this.api, { params });
    }

    obtener(id: number): Observable<Propuesta> {
        return this.http.get<Propuesta>(`${this.api}/${id}`);
    }

    // empresa_id va implícito en el token, no se manda
    crear(data: Omit<Propuesta, 'id_propuesta' | 'empresa_id' | 'fecha_publicacion' | 'estado'>): Observable<{ id_propuesta: number }> {
        return this.http.post<{ id_propuesta: number }>(this.api, data);
    }

    actualizar(id: number, data: Partial<Propuesta>): Observable<any> {
        return this.http.put(`${this.api}/${id}`, data);
    }

    eliminar(id: number): Observable<any> {
        return this.http.delete(`${this.api}/${id}`);
    }
}