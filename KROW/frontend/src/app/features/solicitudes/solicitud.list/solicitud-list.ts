import { DatePipe } from '@angular/common';
import { Component, inject, signal, OnInit } from '@angular/core';
import { SolicitudService } from '../../../core/services/solicitud.service';
import { ConversacionService } from '../../../core/services/conversacion.service';
import { AuthService } from '../../../core/services/auth.service';
import { Solicitud } from '../../../core/models/solicitud.model';

@Component({
    selector: 'app-solicitud-list',
    imports: [DatePipe],
    templateUrl: './solicitud-list.html'
})
export class SolicitudList implements OnInit {
    private svc = inject(SolicitudService);
    private convSvc = inject(ConversacionService);
    private auth = inject(AuthService);

    solicitudes = signal<Solicitud[]>([]);
    cargando = signal(true);

    ngOnInit() {
        this.auth.me().subscribe({
            next: (me) => {
                if (!me.perfil?.id_usuario) { this.cargando.set(false); return; }
                this.svc.listarPorUsuario(me.perfil.id_usuario).subscribe({
                    next: (data) => { this.solicitudes.set(data); this.cargando.set(false); },
                    error: () => this.cargando.set(false)
                });
            },
            error: () => this.cargando.set(false)
        });
    }

    irAConversacion(solicitudId: number) {
        this.convSvc.obtenerPorSolicitud(solicitudId).subscribe({
            next: () => { window.location.href = `/conversaciones/${solicitudId}`; },
            error: () => alert('Aún no hay conversación para esta solicitud')
        });
    }
}