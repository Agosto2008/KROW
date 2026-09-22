import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { Favorito } from '../models';

export interface FavoritoToggleResponse {
  mensaje: 'agregado' | 'eliminado';
}

@Injectable({ providedIn: 'root' })
export class FavoritoService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}/favoritos`;

  listar(usuarioId: number): Observable<Favorito[]> {
    return this.http.get<Favorito[]>(`${this.baseUrl}/usuario/${usuarioId}`);
  }

  alternar(usuarioId: number, propuestaId: number): Observable<FavoritoToggleResponse> {
    return this.http.post<FavoritoToggleResponse>(`${this.baseUrl}/toggle`, {
      usuario_id: usuarioId,
      propuesta_id: propuestaId,
    });
  }
}