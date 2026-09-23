import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { FavoritoConPropuesta } from '../models/Index';

export interface FavoritoToggleResponse {
  mensaje: 'agregado' | 'eliminado';
}

@Injectable({ providedIn: 'root' })
export class FavoritoService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}/favoritos`;

  /**
   * Favoritos del usuario con su propuesta y empresa ya resueltas (1 query).
   * El usuario sale del token: basta mandar el id para validar propiedad.
   */
  listar(usuarioId: number): Observable<FavoritoConPropuesta[]> {
    return this.http.get<FavoritoConPropuesta[]>(`${this.baseUrl}/usuario/${usuarioId}`);
  }

  /** El usuario_id NUNCA va en el body: lo deriva el backend del token */
  alternar(propuestaId: number): Observable<FavoritoToggleResponse> {
    return this.http.post<FavoritoToggleResponse>(`${this.baseUrl}/toggle`, {
      propuesta_id: propuestaId,
    });
  }
}
