import { Component, inject, signal, OnInit } from '@angular/core';
import { DatePipe } from '@angular/common';
import { NotificacionService } from '../../../core/services/notificacion.service';
import { AuthService } from '../../../core/services/auth.service';
import { Notificacion } from '../../../core/models/notificacion.model';

@Component({
    selector: 'app-notificacion-list',
    imports: [DatePipe],
    templateUrl: './notificacion-list.html'
})
export class NotificacionList implements OnInit {
    private svc = inject(NotificacionService);
    private auth = inject(AuthService);

    notifs = signal<Notificacion[]>([]);
    cargando = signal(true);
    private usuarioId = 0;

    ngOnInit() {
        this.auth.me().subscribe(me => {
            if (!me.perfil?.id_usuario) { this.cargando.set(false); return; }
            this.usuarioId = me.perfil.id_usuario;
            this.svc.listar(this.usuarioId).subscribe({
                next: (d) => { this.notifs.set(d); this.cargando.set(false); },
                error: () => this.cargando.set(false)
            });
        });
    }

    marcarLeida(id: number) {
        this.svc.marcarLeida(id).subscribe(() => {
            this.notifs.update(arr => arr.map(n => n.id_notificacion === id ? { ...n, leida: true } : n));
        });
    }

    marcarTodas() {
        this.svc.marcarTodasLeidas(this.usuarioId).subscribe(() => {
            this.notifs.update(arr => arr.map(n => ({ ...n, leida: true })));
        });
    }
}