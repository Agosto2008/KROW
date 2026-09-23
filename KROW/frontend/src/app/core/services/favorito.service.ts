import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Favorito } from '../models/favorito.model';

@Injectable({ providedIn: 'root' })
export class FavoritoService {
    private http = inject(HttpClient);
    private api = `${environment.apiUrl}/favoritos`;

    listar(usuarioId: number): Observable<Favorito[]> {
        return this.http.get<Favorito[]>(`${this.api}/usuario/${usuarioId}`);
    }

    alternar(propuestaId: number): Observable<{ mensaje: 'agregado' | 'eliminado' }> {
        return this.http.post<{ mensaje: 'agregado' | 'eliminado' }>(`${this.api}/toggle`, { propuesta_id: propuestaId });
    }
}