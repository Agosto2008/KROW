import { Component, inject, signal, OnInit, ViewChild, ElementRef, AfterViewChecked } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ConversacionService } from '../../../services/conversacion.service';
import { MensajeService } from '../../../services/mensaje.service';
import { SolicitudService } from '../../../services/solicitud.service';
import { TokenStorageService } from '../../../core/token-storage.service';
import { ToastService } from '../../../shader/toast/toast.service';
import { Conversacion, Mensaje, Solicitud } from '../../../models/Index';
import { EmptyStateComponent } from '../../../shader/empty-state/empty-state.component';
import { SpinnerComponent } from '../../../shader/spinner/spinner.component';
import { BotonComponent } from '../../../shader/boton/boton.component';

@Component({
  selector: 'app-mensajes-page',
  standalone: true,
  imports: [CommonModule, FormsModule, EmptyStateComponent, SpinnerComponent, BotonComponent],
  templateUrl: './mensajes.page.html',
  styleUrl: './mensajes.page.css',
})
export class MensajesPage implements OnInit, AfterViewChecked {
  private readonly conversacionService = inject(ConversacionService);
  private readonly mensajeService = inject(MensajeService);
  private readonly solicitudService = inject(SolicitudService);
  private readonly tokenStorage = inject(TokenStorageService);
  private readonly toast = inject(ToastService);

  @ViewChild('scrollMensajes') scrollMensajes!: ElementRef<HTMLDivElement>;

  readonly conversaciones = signal<Conversacion[]>([]);
  readonly conversacionActiva = signal<Conversacion | null>(null);
  readonly mensajes = signal<Mensaje[]>([]);
  readonly cargando = signal(true);
  readonly cargandoMensajes = signal(false);
  readonly enviando = signal(false);

  nuevoMensaje = '';
  private debeScrollear = false;

  ngOnInit(): void {
    const id = this.tokenStorage.obtenerIdCuenta();
    if (!id) return;
    this.cargarConversaciones(id);
  }

  private cargarConversaciones(usuarioId: number): void {
    this.solicitudService.listarPorUsuario(usuarioId).subscribe({
      next: (solicitudes) => {
        const aceptadas = solicitudes.filter((s) => s.estado === 'ACEPTADA');
        if (aceptadas.length === 0) { this.cargando.set(false); return; }
        let pendientes = aceptadas.length;
        aceptadas.forEach((s) => {
          this.conversacionService.obtenerPorSolicitud(s.id_solicitud).subscribe({
            next: (c) => this.conversaciones.update((lista) => [...lista, c]),
            error: () => {},
            complete: () => {
              if (--pendientes === 0) {
                this.cargando.set(false);
                if (this.conversaciones().length > 0) {
                  this.abrirConversacion(this.conversaciones()[0]);
                }
              }
            },
          });
        });
      },
      error: () => this.cargando.set(false),
    });
  }

  abrirConversacion(c: Conversacion): void {
    this.conversacionActiva.set(c);
    this.cargandoMensajes.set(true);
    this.mensajeService.listar(c.id_conversacion).subscribe({
      next: (msgs) => {
        this.mensajes.set(msgs);
        this.cargandoMensajes.set(false);
        this.debeScrollear = true;
        this.marcarLeidos(c.id_conversacion);
      },
      error: () => this.cargandoMensajes.set(false),
    });
  }

  private marcarLeidos(conversacionId: number): void {
    this.mensajeService.marcarLeidos(conversacionId, 'EMPRESA').subscribe({ error: () => {} });
  }

  enviar(): void {
    const texto = this.nuevoMensaje.trim();
    const c = this.conversacionActiva();
    if (!texto || !c || this.enviando()) return;

    this.enviando.set(true);
    this.mensajeService.enviar(c.id_conversacion, 'USUARIO', texto).subscribe({
      next: (res) => {
        this.mensajes.update((lista) => [...lista, {
          id_mensaje: res.id_mensaje,
          conversacion_id: c.id_conversacion,
          emisor: 'USUARIO',
          contenido: texto,
          fecha_envio: new Date().toISOString(),
          leido: false,
        }]);
        this.nuevoMensaje = '';
        this.enviando.set(false);
        this.debeScrollear = true;
      },
      error: (err) => {
        this.enviando.set(false);
        this.toast.error(err.message || 'No se pudo enviar');
      },
    });
  }

  ngAfterViewChecked(): void {
    if (this.debeScrollear && this.scrollMensajes) {
      this.scrollMensajes.nativeElement.scrollTop = this.scrollMensajes.nativeElement.scrollHeight;
      this.debeScrollear = false;
    }
  }

  onEnter(event: KeyboardEvent): void {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      this.enviar();
    }
  }
}