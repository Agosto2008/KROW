import { Component, inject, signal, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { FavoritoService } from '../../../core/services/favorito.service';
import { PropuestaService } from '../../../core/services/propuesta.service';
import { AuthService } from '../../../core/services/auth.service';
import { Propuesta } from '../../../core/models/propuesta.model';

@Component({
    selector: 'app-favorito-list',
    imports: [RouterLink],
    templateUrl: './favorito-list.html'
})
export class FavoritoList implements OnInit {
    private favSvc = inject(FavoritoService);
    private propSvc = inject(PropuestaService);
    private auth = inject(AuthService);

    propuestas = signal<Propuesta[]>([]);
    cargando = signal(true);

    ngOnInit() {
        this.auth.me().subscribe(me => {
            if (!me.perfil?.id_usuario) { this.cargando.set(false); return; }
            this.favSvc.listar(me.perfil.id_usuario).subscribe(favs => {
                // Traer cada propuesta favorita en paralelo
                const pedidos = favs.map(f => this.propSvc.obtener(f.propuesta_id));
                if (pedidos.length === 0) { this.cargando.set(false); return; }

                let pendientes = pedidos.length;
                const acum: Propuesta[] = [];
                pedidos.forEach(p => p.subscribe({
                    next: (prop) => {
                        acum.push(prop);
                        if (--pendientes === 0) { this.propuestas.set(acum); this.cargando.set(false); }
                    },
                    error: () => { if (--pendientes === 0) { this.propuestas.set(acum); this.cargando.set(false); } }
                }));
            });
        });
    }

    quitar(id: number) {
        this.favSvc.alternar(id).subscribe(() => {
            this.propuestas.update(arr => arr.filter(p => p.id_propuesta !== id));
        });
    }
}