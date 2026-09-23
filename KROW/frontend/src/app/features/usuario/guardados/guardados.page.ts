import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../../core/api/auth.service';
import { FavoritoService } from '../../../core/api/favorito.service';
import { ToastService } from '../../../shared/toast/toast.service';
import { FavoritoConPropuesta } from '../../../core/models/Index';
import { PropuestaCardComponent } from '../../../shared/propuesta-card/propuesta-card.component';
import { EmptyStateComponent } from '../../../shared/empty-state/empty-state.component';
import { SpinnerComponent } from '../../../shared/spinner/spinner.component';

@Component({
  selector: 'app-guardados-page',
  standalone: true,
  imports: [CommonModule, RouterLink, PropuestaCardComponent, EmptyStateComponent, SpinnerComponent],
  templateUrl: './guardados.page.html',
  // shell de lista compartido (sin @import entre páginas)
  styleUrls: ['./guardados.page.css', '../../../shared/estilos/pagina.css'],
})
export class GuardadosPage implements OnInit {
  private readonly favoritoService = inject(FavoritoService);
  private readonly auth = inject(AuthService);
  private readonly toast = inject(ToastService);

  /** 1 sola query: favorito + propuesta + empresa, sin N+1 */
  readonly favoritos = signal<FavoritoConPropuesta[]>([]);
  readonly cargando = signal(true);

  ngOnInit(): void {
    const idUsuario = this.auth.idUsuario();
    if (!idUsuario) {
      this.cargando.set(false);
      return;
    }

    this.favoritoService.listar(idUsuario).subscribe({
      next: (favs) => { this.favoritos.set(favs); this.cargando.set(false); },
      error: () => this.cargando.set(false),
    });
  }

  onQuitar(propuestaId: number): void {
    this.favoritoService.alternar(propuestaId).subscribe({
      next: () => {
        this.favoritos.update((lista) => lista.filter((f) => f.id_propuesta !== propuestaId));
        this.toast.info('Eliminado de guardados');
      },
      error: () => this.toast.error('No se pudo quitar'),
    });
  }
}
