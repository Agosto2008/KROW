import { Component, Input } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-logo',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './logo.component.html',
  styleUrl: './logo.component.css',
})
export class LogoComponent {
  @Input() enlace: string = '/';
  @Input() variante: 'claro' | 'oscuro' = 'oscuro';
  @Input() tamanio: 'sm' | 'md' | 'lg' = 'md';
}