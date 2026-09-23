import { SlicePipe } from '@angular/common';
import { Component, inject, signal, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { PropuestaService } from '../../../core/services/propuesta.service';
import { FavoritoService } from '../../../core/services/favorito.service';
import { AuthService } from '../../../core/services/auth.service';
import { Propuesta, TipoPropuesta, ModalidadPropuesta } from '../../../core/models/propuesta.model';

@Component({
    selector: 'app-propuesta-list',
    imports: [RouterLink, FormsModule, SlicePipe],
    templateUrl: './propuesta-list.html',
    styleUrl: './propuesta-list.css'
})
export class PropuestaList implements OnInit {
    private propuestaSvc = inject(PropuestaService);
    private favoritoSvc = inject(FavoritoService);
    auth = inject(AuthService);

    propuestas = signal<Propuesta[]>([]);
    cargando = signal(true);

    tipo = '';
    modalidad = '';

    tipos: TipoPropuesta[] = ['PREPRACTICA', 'PRACTICA', 'PASANTIA', 'TRABAJO'];
    modalidades: ModalidadPropuesta[] = ['PRESENCIAL', 'REMOTO', 'HIBRIDO'];

    ngOnInit() { this.cargar(); }

    cargar() {
        this.cargando.set(true);
        const filtros: Record<string, string> = {};
        if (this.tipo) filtros['tipo'] = this.tipo;
        if (this.modalidad) filtros['modalidad'] = this.modalidad;

        this.propuestaSvc.listar(filtros).subscribe({
            next: (data) => { this.propuestas.set(data); this.cargando.set(false); },
            error: () => this.cargando.set(false)
        });
    }

    toggleFavorito(id: number, event: Event) {
        event.stopPropagation();
        this.favoritoSvc.alternar(id).subscribe();
    }
}