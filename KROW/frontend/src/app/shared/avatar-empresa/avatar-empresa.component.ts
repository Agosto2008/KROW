import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-avatar-empresa',
  standalone: true,
  templateUrl: './avatar-empresa.component.html',
  styleUrl: './avatar-empresa.component.css',
})
export class AvatarEmpresaComponent {
  @Input() fotografia?: string | null;
  @Input() tamanio: 'sm' | 'md' | 'lg' = 'md';
}