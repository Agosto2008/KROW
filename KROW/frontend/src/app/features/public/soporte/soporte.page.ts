import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

/**
 * Soporte y contacto (Fase 8.1): página estática mínima con datos de
 * contacto y preguntas frecuentes; enlazada desde el footer.
 */
@Component({
  selector: 'app-soporte-page',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './soporte.page.html',
  styleUrl: './soporte.page.css',
})
export class SoportePage {}
