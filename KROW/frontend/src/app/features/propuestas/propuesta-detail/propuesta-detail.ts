import { DatePipe } from '@angular/common';
import { Component, inject, signal, input, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { PropuestaService } from '../../../core/services/propuesta.service';
import { SolicitudService } from '../../../core/services/solicitud.service';
import { FavoritoService } from '../../../core/services/favorito.service';
import { AuthService } from '../../../core/services/auth.service';
import { Propuesta } from '../../../core/models/propuesta.model';

@Component({
    selector: 'app-propuesta-detail',
    imports: [RouterLink, DatePipe],
    templateUrl: './propuesta-detail.html',
    styleUrl: './propuesta-detail.css'
})
export class PropuestaDetail implements OnInit {
    id = input.required<string>();

    private propuestaSvc = inject(PropuestaService);
    private solicitudSvc = inject(SolicitudService);
    private favoritoSvc = inject(FavoritoService);
    auth = inject(AuthService);

    propuesta = signal<Propuesta | null>(null);
    cargando = signal(true);
    mensaje = signal<string | null>(null);

    ngOnInit() {
        this.propuestaSvc.obtener(Number(this.id())).subscribe({
            next: (p) => { this.propuesta.set(p); this.cargando.set(false); },
            error: () => this.cargando.set(false)
        });
    }

    aplicar() {
        const p = this.propuesta();
        if (!p) return;
        this.solicitudSvc.aplicar(p.id_propuesta).subscribe({
            next: () => this.mensaje.set('✅ Solicitud enviada'),
            error: (e) => this.mensaje.set(e.error?.mensaje || 'Error al aplicar')
        });
    }

    toggleFavorito() {
        const p = this.propuesta();
        if (!p) return;
        this.favoritoSvc.alternar(p.id_propuesta).subscribe();
    }
}