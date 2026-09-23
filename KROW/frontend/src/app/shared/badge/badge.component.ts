import { Component, Input } from '@angular/core';

export type VarianteBadge =
  | 'neutro'
  | 'tipo'
  | 'modalidad'
  | 'estado-activa'
  | 'estado-pausada'
  | 'estado-cerrada'
  | 'estado-vencida'
  | 'estado-pendiente'
  | 'estado-revision'
  | 'estado-aceptada'
  | 'estado-rechazada'
  | 'estado-cancelada'
  | 'verificada';

@Component({
  selector: 'app-badge',
  standalone: true,
  templateUrl: './badge.component.html',
  styleUrl: './badge.component.css',
})
export class BadgeComponent {
  @Input() variante: VarianteBadge = 'neutro';
  @Input() conIcono = false;
}