import { Component, inject, signal, computed, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { PropuestaService } from '../../../core/api/propuesta.service';
import { EmpresaService } from '../../../core/api/empresa.service';
import { PropuestaConEmpresa } from '../../../core/models/Index';
import { BotonComponent } from '../../../shared/boton/boton.component';
import { BadgeComponent } from '../../../shared/badge/badge.component';
import { SpinnerComponent } from '../../../shared/spinner/spinner.component';

/**
 * Landing pública.
 *
 * Las cifras son REALES: salen de los totales del servidor
 * (`GET /propuestas` y `GET /empresas` con `por_pagina=1`, así solo
 * pedimos el número y no las filas). Nada de números inventados.
 */
@Component({
  selector: 'app-landing-page',
  standalone: true,
  imports: [CommonModule, RouterLink, BotonComponent, BadgeComponent, SpinnerComponent],
  templateUrl: './landing.page.html',
  styleUrl: './landing.page.css',
})
export class LandingPage implements OnInit {
  private readonly propuestaService = inject(PropuestaService);
  private readonly empresaService = inject(EmpresaService);

  /** Destacadas: cada fila trae su empresa embebida (sin N+1) */
  readonly destacadas = signal<PropuestaConEmpresa[]>([]);
  readonly cargando = signal(true);

  // contadores reales (empezamos en null = "cargando", no en un número falso)
  private readonly totalOfertas = signal<number | null>(null);
  private readonly totalEmpresas = signal<number | null>(null);
  private readonly totalVerificadas = signal<number | null>(null);

  readonly stats = computed(() => [
    { valor: this.totalOfertas(), etiqueta: 'Ofertas activas' },
    { valor: this.totalEmpresas(), etiqueta: 'Empresas en KROW' },
    { valor: this.totalVerificadas(), etiqueta: 'Empresas verificadas' },
    { valor: 4, etiqueta: 'Tipos de oportunidad' },
  ]);

  /** Tipos de oportunidad (los 4 enums de `Propuesta.tipo`) */
  readonly tipos = [
    {
      clave: 'PREPRACTICA',
      nombre: 'Prepráctica',
      texto: 'Primer contacto con el mundo laboral: observa, aprende y gana experiencia.',
    },
    {
      clave: 'PRACTICA',
      nombre: 'Prácticas',
      texto: 'Aplica lo que estudiaste en proyectos reales, con acompañamiento.',
    },
    {
      clave: 'PASANTIA',
      nombre: 'Pasantías',
      texto: 'Inmersión de tiempo completo en un equipo, para lanzarte con ventaja.',
    },
    {
      clave: 'TRABAJO',
      nombre: 'Trabajo',
      texto: 'Tu primer empleo formal, con condiciones claras desde el primer día.',
    },
  ];

  /** Cómo funciona: 3 pasos, sin humo */
  readonly pasos = [
    {
      numero: '1',
      titulo: 'Crea tu perfil',
      texto: 'Regístrate gratis, cuenta qué te gusta y adjunta tu CV. Menos de 5 minutos.',
    },
    {
      numero: '2',
      titulo: 'Explora y postula',
      texto: 'Filtra por tipo, modalidad o ciudad. Postula a lo que te llame la atención.',
    },
    {
      numero: '3',
      titulo: 'Conversa y avanza',
      texto: 'La empresa te escribe por el chat interno: entrevista, acuerda y empieza.',
    },
  ];

  ngOnInit(): void {
    this.cargar();
  }

  private cargar(): void {
    // Destacadas + total real de ofertas activas, en una sola petición
    this.propuestaService.buscar({ estado: 'ACTIVA', por_pagina: 3 }).subscribe({
      next: (res) => {
        this.destacadas.set(res.datos.slice(0, 3));
        this.totalOfertas.set(res.total);
        this.cargando.set(false);
      },
      error: () => this.cargando.set(false),
    });

    // Totales de empresas: solo el número (1 fila por consulta)
    this.empresaService.buscar({ por_pagina: 1 }).subscribe({
      next: (res) => this.totalEmpresas.set(res.total),
      error: () => {},
    });

    this.empresaService.buscar({ por_pagina: 1, verificadas: true }).subscribe({
      next: (res) => this.totalVerificadas.set(res.total),
      error: () => {},
    });
  }

  /** Muestra "…" mientras el total no llega, nunca un número inventado */
  verValor(valor: number | null): string {
    return valor === null ? '…' : String(valor);
  }

  /** Enum -> texto legible para el badge */
  etiquetaTipo(tipo: string): string {
    const mapa: Record<string, string> = {
      PREPRACTICA: 'Prepráctica',
      PRACTICA: 'Práctica',
      PASANTIA: 'Pasantía',
      TRABAJO: 'Trabajo',
    };
    return mapa[tipo] ?? tipo;
  }

  etiquetaModalidad(modalidad: string): string {
    const mapa: Record<string, string> = {
      PRESENCIAL: 'presencial',
      REMOTO: 'remoto',
      HIBRIDO: 'híbrido',
    };
    return mapa[modalidad] ?? modalidad.toLowerCase();
  }
}
