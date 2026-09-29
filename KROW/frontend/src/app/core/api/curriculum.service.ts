import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Curriculum } from '../models/Index';
import { MensajeResponse } from '../mensaje-response.model';

@Injectable({ providedIn: 'root' })
export class CurriculumService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}/curriculums`;

  obtenerPorUsuario(usuarioId: number): Observable<Curriculum> {
    return this.http.get<Curriculum>(`${this.baseUrl}/usuario/${usuarioId}`);
  }

  guardar(usuarioId: number, data: Partial<Curriculum>): Observable<MensajeResponse> {
    return this.http.put<MensajeResponse>(`${this.baseUrl}/usuario/${usuarioId}`, data);
  }
}