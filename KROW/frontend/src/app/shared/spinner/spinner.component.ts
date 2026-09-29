import { Component, Input } from '@angular/core';

/**
 * Indicador de carga del design system.
 * Plantilla y estilos en archivos propios (igual que el resto de shared/).
 */
@Component({
  selector: 'app-spinner',
  standalone: true,
  templateUrl: './spinner.component.html',
  styleUrl: './spinner.component.css',
})
export class SpinnerComponent {
  @Input() tamanio = 28;
  @Input() mensaje = '';
}
