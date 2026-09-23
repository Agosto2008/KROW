import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NotificacionService } from '../../../services/notificacion.service';
import { TokenStorageService } from '../../../core/token-storage.service';
import { ToastService } from '../../../shader/toast/toast.service';
import { Notificacion } from '../../../models/Index';
import { EmptyStateComponent } from '../../../shader/empty-state/empty-state.component';
import { SpinnerComponent } from '../../../shader/spinner/spinner.component';
import { BotonComponent } from '../../../shader/boton/boton.component';

@Component({
  selector: 'app-notificaciones-page',
  standalone: true,
  imports: [CommonModule, EmptyStateComponent, SpinnerComponent, BotonComponent],
  templateUrl: './notificaciones.page.html',
  styleUrl: './notificaciones.page.css',
})
export class NotificacionesPage implements OnInit {
  private readonly notificacionService = inject(NotificacionService);
  private readonly tokenStorage = inject(TokenStorageService);
  private readonly toast = inject(ToastService);

  readonly notificaciones = signal<Notificacion[]>([]);
  readonly cargando = signal(true);

  ngOnInit(): void {
    const id = this.tokenStorage.obtenerIdCuenta();
    if (!id) return;
    this.cargar(id);
  }

  private cargar(id: number): void {
    this.notificacionService.listar(id).subscribe({
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
    const id = this.tokenStorage.obtenerIdCuenta();
    if (!id) return;
    this.notificacionService.marcarTodasLeidas(id).subscribe({
      next: () => {
        this.notificaciones.update((lista) => lista.map((x) => ({ ...x, leida: true })));
        this.toast.exito('Todas marcadas como leídas');
      },
      error: () => this.toast.error('No se pudo marcar'),
    });
  }
}