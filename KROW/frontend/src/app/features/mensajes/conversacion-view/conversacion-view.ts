import { DatePipe } from '@angular/common';
import { Component, inject, signal, input, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ConversacionService } from '../../../core/services/conversacion.service';
import { MensajeService } from '../../../core/services/mensaje.service';
import { AuthService } from '../../../core/services/auth.service';
import { Conversacion } from '../../../core/models/conversacion.model';
import { Mensaje } from '../../../core/models/mensaje.model';

@Component({
    selector: 'app-conversacion-view',
    imports: [FormsModule, DatePipe],
    templateUrl: './conversacion-view.html',
    styleUrl: './conversacion-view.css'
})
export class ConversacionView implements OnInit {
    solicitudId = input.required<string>();

    private convSvc = inject(ConversacionService);
    private msgSvc = inject(MensajeService);
    auth = inject(AuthService);

    conversacion = signal<Conversacion | null>(null);
    mensajes = signal<Mensaje[]>([]);
    nuevo = '';
    cargando = signal(true);

    ngOnInit() {
        this.convSvc.obtenerPorSolicitud(Number(this.solicitudId())).subscribe({
            next: (c) => {
                this.conversacion.set(c);
                this.cargarMensajes(c.id_conversacion);
                this.msgSvc.marcarLeidos(c.id_conversacion).subscribe();
            },
            error: () => this.cargando.set(false)
        });
    }

    cargarMensajes(id: number) {
        this.msgSvc.listar(id).subscribe({
            next: (data) => { this.mensajes.set(data); this.cargando.set(false); },
            error: () => this.cargando.set(false)
        });
    }

    enviar() {
        const conv = this.conversacion();
        if (!conv || !this.nuevo.trim()) return;
        this.msgSvc.enviar(conv.id_conversacion, this.nuevo).subscribe({
            next: () => { this.nuevo = ''; this.cargarMensajes(conv.id_conversacion); }
        });
    }

    esMio(m: Mensaje): boolean {
        return m.emisor === this.auth.rol();
    }
}