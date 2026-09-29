import { Component, inject, signal, OnInit, ViewChild, ElementRef, AfterViewChecked } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ConversacionService } from '../../../core/api/conversacion.service';
import { MensajeService } from '../../../core/api/mensaje.service';
import { AuthService } from '../../../core/api/auth.service';
import { ToastService } from '../../../shared/toast/toast.service';
import { ConversacionResumen, Mensaje } from '../../../core/models/Index';
import { EmptyStateComponent } from '../../../shared/empty-state/empty-state.component';
import { SpinnerComponent } from '../../../shared/spinner/spinner.component';
import { BotonComponent } from '../../../shared/boton/boton.component';

@Component({
  selector: 'app-mensajes-page',
  standalone: true,
  imports: [CommonModule, FormsModule, EmptyStateComponent, SpinnerComponent, BotonComponent],
  templateUrl: './mensajes.page.html',
  // estilos del chat compartidos con la variante de empresa (sin @import)
  styleUrls: ['./mensajes.page.css', '../../../shared/estilos/chat.css'],
})
export class MensajesPage implements OnInit, AfterViewChecked {
  private readonly conversacionService = inject(ConversacionService);
  private readonly mensajeService = inject(MensajeService);
  private readonly auth = inject(AuthService);
  private readonly toast = inject(ToastService);

  @ViewChild('scrollMensajes') scrollMensajes!: ElementRef<HTMLDivElement>;

  /** Sidebar en 1 sola query: otro lado, oferta, último mensaje y no leídos */
  readonly conversaciones = signal<ConversacionResumen[]>([]);
  readonly conversacionActiva = signal<ConversacionResumen | null>(null);
  readonly mensajes = signal<Mensaje[]>([]);
  readonly cargando = signal(true);
  readonly cargandoMensajes = signal(false);
  readonly enviando = signal(false);

  nuevoMensaje = '';
  private debeScrollear = false;

  ngOnInit(): void {
    this.conversacionService.listarPropias().subscribe({
      next: (cs) => {
        this.conversaciones.set(cs);
        this.cargando.set(false);
        if (cs.length > 0) this.abrirConversacion(cs[0]);
      },
      error: () => this.cargando.set(false),
    });
  }

  abrirConversacion(c: ConversacionResumen): void {
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
    this.mensajeService.marcarLeidos(conversacionId).subscribe({
      next: () => this.conversaciones.update((lista) =>
        lista.map((c) => (c.id_conversacion === conversacionId ? { ...c, no_leidos: 0 } : c))
      ),
      error: () => {},
    });
  }

  enviar(): void {
    const texto = this.nuevoMensaje.trim();
    const c = this.conversacionActiva();
    if (!texto || !c || this.enviando()) return;

    this.enviando.set(true);
    // el emisor lo deriva el backend: nadie puede suplantar al otro lado
    this.mensajeService.enviar(c.id_conversacion, texto).subscribe({
      next: (res) => {
        this.mensajes.update((lista) => [...lista, {
          id_mensaje: res.id_mensaje,
          conversacion_id: c.id_conversacion,
          emisor: this.auth.rol() === 'EMPRESA' ? 'EMPRESA' : 'USUARIO',
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
