import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-spinner',
  standalone: true,
  template: `
    <div class="spinner-contenedor">
      <span class="spinner" [style.width.px]="tamanio" [style.height.px]="tamanio"></span>
      @if (mensaje) {
        <p class="spinner__mensaje">{{ mensaje }}</p>
      }
    </div>
  `,
  styles: [`
    .spinner-contenedor {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: var(--esp-7) 0;
      gap: var(--esp-3);
    }
    .spinner {
      display: inline-block;
      border: 2px solid var(--gris-piedra);
      border-top-color: var(--negro-puro);
      border-radius: 50%;
      animation: girar 0.8s linear infinite;
    }
    .spinner__mensaje {
      color: var(--gris-medio);
      font-size: 14px;
      margin: 0;
    }
    @keyframes girar { to { transform: rotate(360deg); } }
  `],
})
export class SpinnerComponent {
  @Input() tamanio = 28;
  @Input() mensaje = '';
}