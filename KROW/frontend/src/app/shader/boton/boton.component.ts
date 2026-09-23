import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

export type VarianteBoton = 'primario' | 'secundario' | 'fantasma' | 'peligro';
export type TamanioBoton = 'sm' | 'md' | 'lg';

@Component({
  selector: 'app-boton',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './boton.component.html',
  styleUrl: './boton.component.css',
})
export class BotonComponent {
  @Input() variante: VarianteBoton = 'primario';
  @Input() tamanio: TamanioBoton = 'md';
  @Input() tipo: 'button' | 'submit' | 'reset' = 'button';
  @Input() disabled = false;
  @Input() cargando = false;
  @Input() bloque = false;

  @Output() click = new EventEmitter<MouseEvent>();

  onClick(event: MouseEvent): void {
    if (!this.disabled && !this.cargando) {
      this.click.emit(event);
    }
  }
}