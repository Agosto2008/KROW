import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NotificacionService } from '../../../core/api/notificacion.service';
import { ToastService } from '../../../shared/toast/toast.service';
import { Notificacion } from '../../../core/models/Index';
import { EmptyStateComponent } from '../../../shared/empty-state/empty-state.component';
import { SpinnerComponent } from '../../../shared/spinner/spinner.component';
import { BotonComponent } from '../../../shared/boton/boton.component';

@Component({
  selector: 'app-notificaciones-page',
  standalone: true,
  imports: [CommonModule, EmptyStateComponent, SpinnerComponent, BotonComponent],
  templateUrl: './notificaciones.page.html',
  // shell de lista compartido (sin @import entre páginas)
  styleUrls: ['./notificaciones.page.css', '../../../shared/estilos/pagina.css'],
})
export class NotificacionesPage implements OnInit {
  private readonly notificacionService = inject(NotificacionService);
  private readonly toast = inject(ToastService);

  readonly notificaciones = signal<Notificacion[]>([]);
  readonly cargando = signal(true);

  ngOnInit(): void {
    // la cuenta sale del token: no hace falta mandar ningún id
    this.notificacionService.listar().subscribe({
      next: (n) => { this.notificaciones.set(n); this.cargando.set(false); },
      error: () => this.cargando.set(false),
    });
  }

  marcarLeida(n: Notificacion): void {
    if (n.leida) return;
    this.notificacionService.marcarLeida(n.id_notificacion).subscribe({
      next: () => this.notificaciones.update((lista) =>
        lista.map((x) => x.id_notificacion === n.id_notificacion ? { ...x, leida: true } : x)
      ),
      error: () => {},
    });
  }

  marcarTodas(): void {
    this.notificacionService.marcarTodasLeidas().subscribe({
      next: () => this.notificaciones.update((lista) =>
        lista.map((x) => ({ ...x, leida: true }))
      ),
      error: () => this.toast.error('No se pudieron marcar como leídas'),
    });
  }
}
