import { DatePipe } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Propuesta } from '../../models/Index';
import { BadgeComponent } from '../badge/badge.component';
import { AvatarEmpresaComponent } from '../avatar-empresa/avatar-empresa.component';

@Component({
  selector: 'app-propuesta-card',
  standalone: true,
  imports: [RouterLink, BadgeComponent, AvatarEmpresaComponent, DatePipe],
  templateUrl: './propuesta-card.component.html',
  styleUrl: './propuesta-card.component.css',
})
export class PropuestaCardComponent {
  @Input({ required: true }) propuesta!: Propuesta;
  @Input() empresaNombre = '';
  @Input() empresaFotografia?: string | null;
  @Input() empresaVerificada = false;
  @Input() esFavorito = false;

  @Output() toggleFavorito = new EventEmitter<number>();

  onFavorito(event: MouseEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.toggleFavorito.emit(this.propuesta.id_propuesta);
  }

  get etiquetaTipo(): string {
    const mapa: Record<string, string> = {
      PREPRACTICA: 'Prepráctica',
      PRACTICA: 'Prácticas',
      PASANTIA: 'Pasantía',
      TRABAJO: 'Trabajo',
    };
    return mapa[this.propuesta.tipo] ?? this.propuesta.tipo;
  }

  get etiquetaModalidad(): string {
    const mapa: Record<string, string> = {
      PRESENCIAL: 'presencial',
      REMOTO: 'remoto',
      HIBRIDO: 'híbrido',
    };
    return mapa[this.propuesta.modalidad] ?? this.propuesta.modalidad;
  }

  get pagoTexto(): string {
    if (this.propuesta.pago == null) return 'No remunerado';
    return `${this.propuesta.pago} €/mes`;
  }
}