import { Component, inject, signal, OnInit, ViewChild, ElementRef, AfterViewChecked } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { EmpresaService } from '../../../services/empresa.service';
import { PropuestaService } from '../../../services/propuesta.service';
import { SolicitudService } from '../../../services/solicitud.service';
import { ConversacionService } from '../../../services/conversacion.service';
import { MensajeService } from '../../../services/mensaje.service';
import { TokenStorageService } from '../../../core/token-storage.service';
import { ToastService } from '../../../shader/toast/toast.service';
import { Conversacion, Mensaje, Solicitud, Empresa, Propuesta } from '../../../models/Index';
import { EmptyStateComponent } from '../../../shader/empty-state/empty-state.component';
import { SpinnerComponent } from '../../../shader/spinner/spinner.component';
import { BotonComponent } from '../../../shader/boton/boton.component';

interface ConversacionInfo extends Conversacion {
  _solicitud?: Solicitud;
  _propuesta?: Propuesta;
}

@Component({
  selector: 'app-empresa-mensajes-page',
  standalone: true,
  imports: [CommonModule, FormsModule, EmptyStateComponent, SpinnerComponent, BotonComponent],
  templateUrl: './mensajes.page.html',
  styleUrl: './mensajes.page.css',
})
export class EmpresaMensajesPage implements OnInit, AfterViewChecked {
  private readonly empresaService = inject(EmpresaService);
  private readonly propuestaService = inject(PropuestaService);
  private readonly solicitudService = inject(SolicitudService);
  private readonly conversacionService = inject(ConversacionService);
  private readonly mensajeService = inject(MensajeService);
  private readonly tokenStorage = inject(TokenStorageService);
  private readonly toast = inject(ToastService);

  @ViewChild('scrollMensajes') scrollMensajes!: ElementRef<HTMLDivElement>;

  readonly conversaciones = signal<ConversacionInfo[]>([]);
  readonly conversacionActiva = signal<ConversacionInfo | null>(null);
  readonly mensajes = signal<Mensaje[]>([]);
  readonly cargando = signal(true);
  readonly cargandoMensajes = signal(false);
  readonly enviando = signal(false);

  nuevoMensaje = '';
  private debeScrollear = false;

  ngOnInit(): void {
    const id = this.tokenStorage.obtenerIdCuenta();
    if (!id) return;

    this.empresaService.listar().subscribe({
      next: (emps) => {
        const mia = emps.find((e) => e.cuenta_id === id);
        if (!mia) { this.cargando.set(false); return; }
        this.cargarConversaciones(mia.id_empresa);
      },
      error: () => this.cargando.set(false),
    });
  }

  private cargarConversaciones(empresaId: number): void {
    this.propuestaService.listar({ empresa_id: empresaId }).subscribe({
      next: (props) => {
        if (props.length === 0) { this.cargando.set(false); return; }
        let pendientes = props.length;
        props.forEach((p) => {
          this.solicitudService.listarPorPropuesta(p.id_propuesta).subscribe({
            next: (ss) => {
              const aceptadas = ss.filter((s) => s.estado === 'ACEPTADA');
              aceptadas.forEach((s) => {
                this.conversacionService.obtenerPorSolicitud(s.id_solicitud).subscribe({
                  next: (c) => this.conversaciones.update((lista) => [...lista, { ...c, _solicitud: s, _propuesta: p }]),
                  error: () => {},
                });
              });
            },
            error: () => {},
            complete: () => {
              if (--pendientes === 0) {
                this.cargando.set(false);
                if (this.conversaciones().length > 0) this.abrirConversacion(this.conversaciones()[0]);
              }
            },
          });
        });
      },
      error: () => this.cargando.set(false),
    });
  }

  abrirConversacion(c: ConversacionInfo): void {
    this.conversacionActiva.set(c);
    this.cargandoMensajes.set(true);
    this.mensajeService.listar(c.id_conversacion).subscribe({
      next: (msgs) => {
        this.mensajes.set(msgs);
        this.cargandoMensajes.set(false);
        this.debeScrollear = true;
        this.mensajeService.marcarLeidos(c.id_conversacion, 'USUARIO').subscribe({ error: () => {} });
      },
      error: () => this.cargandoMensajes.set(false),
    });
  }

  enviar(): void {
    const texto = this.nuevoMensaje.trim();
    const c = this.conversacionActiva();
    if (!texto || !c || this.enviando()) return;

    this.enviando.set(true);
    this.mensajeService.enviar(c.id_conversacion, 'EMPRESA', texto).subscribe({
      next: (res) => {
        this.mensajes.update((lista) => [...lista, {
          id_mensaje: res.id_mensaje, conversacion_id: c.id_conversacion,
          emisor: 'EMPRESA', contenido: texto,
          fecha_envio: new Date().toISOString(), leido: false,
        }]);
        this.nuevoMensaje = '';
        this.enviando.set(false);
        this.debeScrollear = true;
      },
      error: (err) => { this.enviando.set(false); this.toast.error(err.message || 'No se pudo enviar'); },
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