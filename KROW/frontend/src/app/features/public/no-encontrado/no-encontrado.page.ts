import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CommonModule, Location } from '@angular/common';
import { inject } from '@angular/core';
import { EmptyStateComponent } from '../../../shared/empty-state/empty-state.component';
import { BotonComponent } from '../../../shared/boton/boton.component';

/**
 * 404 real: se muestra en la URL que no existe en vez de redirigir
 * silenciosamente al home (antes `path: '**' → redirectTo: ''`).
 */
@Component({
  selector: 'app-no-encontrado-page',
  standalone: true,
  imports: [CommonModule, RouterLink, EmptyStateComponent, BotonComponent],
  templateUrl: './no-encontrado.page.html',
  styleUrl: './no-encontrado.page.css',
})
export class NoEncontradoPage {
  private readonly location = inject(Location);

  /** Vuelve a donde estaba el usuario, si hay por dónde */
  volver(): void {
    if (window.history.length > 1) this.location.back();
  }
}
