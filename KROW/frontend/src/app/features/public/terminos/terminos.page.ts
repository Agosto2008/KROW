import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

/**
 * Términos y condiciones (Fase 8.1): página estática mínima de ley,
 * enlazada desde el footer.
 */
@Component({
  selector: 'app-terminos-page',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './terminos.page.html',
  styleUrl: './terminos.page.css',
})
export class TerminosPage {}
