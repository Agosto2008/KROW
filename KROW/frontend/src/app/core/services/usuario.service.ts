import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Usuario } from '../models/usuario.model';

@Injectable({ providedIn: 'root' })
export class UsuarioService {
    private http = inject(HttpClient);
    private api = `${environment.apiUrl}/usuarios`;

    obtener(id: number): Observable<Usuario> {
        return this.http.get<Usuario>(`${this.api}/${id}`);
    }

    actualizar(id: number, data: Partial<Usuario>): Observable<any> {
        return this.http.put(`${this.api}/${id}`, data);
    }

    eliminar(id: number): Observable<any> {
        return this.http.delete(`${this.api}/${id}`);
    }
}