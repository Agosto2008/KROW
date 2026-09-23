import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Curriculum } from '../models/curriculum.model';

@Injectable({ providedIn: 'root' })
export class CurriculumService {
    private http = inject(HttpClient);
    private api = `${environment.apiUrl}/curriculums`;

    obtener(usuarioId: number): Observable<Curriculum> {
        return this.http.get<Curriculum>(`${this.api}/usuario/${usuarioId}`);
    }

    guardar(usuarioId: number, data: Partial<Curriculum>): Observable<any> {
        return this.http.put(`${this.api}/usuario/${usuarioId}`, data);
    }
}