import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Empresa } from '../models/empresa.model';

@Injectable({ providedIn: 'root' })
export class EmpresaService {
    private http = inject(HttpClient);
    private api = `${environment.apiUrl}/empresas`;

    listar(): Observable<Empresa[]> {
        return this.http.get<Empresa[]>(this.api);
    }

    obtener(id: number): Observable<Empresa> {
        return this.http.get<Empresa>(`${this.api}/${id}`);
    }

    actualizar(id: number, data: Partial<Empresa>): Observable<any> {
        return this.http.put(`${this.api}/${id}`, data);
    }
}