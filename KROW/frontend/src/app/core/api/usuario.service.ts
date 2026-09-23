import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Usuario, PerfilPublico } from '../models/Index';
import { MensajeResponse } from '../mensaje-response.model';

@Injectable({ providedIn: 'root' })
export class UsuarioService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}/usuarios`;

  obtenerPorId(id: number): Observable<Usuario> {
    return this.http.get<Usuario>(`${this.baseUrl}/${id}`);
  }

  /**
   * Perfil público con CV resumido (sin teléfono/dirección/nacimiento).
   * Pensado para que la EMPRESA conozca a un postulante.
   */
  obtenerPublico(id: number): Observable<PerfilPublico> {
    return this.http.get<PerfilPublico>(`${this.baseUrl}/${id}/publico`);
  }

  actualizar(id: number, data: Partial<Usuario>): Observable<MensajeResponse> {
    return this.http.put<MensajeResponse>(`${this.baseUrl}/${id}`, data);
  }

  eliminar(id: number): Observable<MensajeResponse> {
    return this.http.delete<MensajeResponse>(`${this.baseUrl}/${id}`);
  }
}
