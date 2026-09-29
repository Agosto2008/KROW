import { Component, inject, signal, computed, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { EmpresaService } from '../../../core/api/empresa.service';
import { Empresa, Paginado } from '../../../core/models/Index';
import { BadgeComponent } from '../../../shared/badge/badge.component';
import { AvatarEmpresaComponent } from '../../../shared/avatar-empresa/avatar-empresa.component';
import { EmptyStateComponent } from '../../../shared/empty-state/empty-state.component';
import { SpinnerComponent } from '../../../shared/spinner/spinner.component';
import { BotonComponent } from '../../../shared/boton/boton.component';

/**
 * Directorio público de empresas.
 * Busca y pagina en el servidor (GET /empresas?buscar=&pagina=).
 */
@Component({
  selector: 'app-empresas-page',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    BadgeComponent,
    AvatarEmpresaComponent,
    EmptyStateComponent,
    SpinnerComponent,
    BotonComponent,
  ],
  templateUrl: './empresas.page.html',
  styleUrls: ['./empresas.page.css', '../../../shared/estilos/pagina.css'],
})
export class EmpresasPage implements OnInit {
  private readonly empresaService = inject(EmpresaService);

  readonly empresas = signal<Empresa[]>([]);
  readonly cargando = signal(true);
  readonly busqueda = signal('');
  readonly soloVerificadas = signal(false);

  readonly pagina = signal(1);
  readonly total = signal(0);
  readonly porPagina = 12;

  readonly totalPaginas = computed(() =>
    Math.max(1, Math.ceil(this.total() / this.porPagina))
  );

  ngOnInit(): void {
    this.cargar();
  }

  private cargar(): void {
    this.cargando.set(true);

    this.empresaService
      .buscar({
        buscar: this.busqueda().trim() || undefined,
        verificadas: this.soloVerificadas() || undefined,
        pagina: this.pagina(),
        por_pagina: this.porPagina,
      })
      .subscribe({
        next: (res: Paginado<Empresa>) => {
          this.empresas.set(res.datos);
          this.total.set(res.total);
          this.cargando.set(false);
        },
        error: () => this.cargando.set(false),
      });
  }

  aplicarBusqueda(event: Event): void {
    const valor = (event.target as HTMLInputElement).value;
    this.busqueda.set(valor);
    this.pagina.set(1);
    this.debounce();
  }

  toggleVerificadas(): void {
    this.soloVerificadas.update((v) => !v);
    this.pagina.set(1);
    this.cargar();
  }

  cambiarPagina(delta: number): void {
    const nueva = this.pagina() + delta;
    if (nueva < 1 || nueva > this.totalPaginas()) return;
    this.pagina.set(nueva);
    this.cargar();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  private timer: ReturnType<typeof setTimeout> | null = null;

  private debounce(): void {
    if (this.timer) clearTimeout(this.timer);
    this.timer = setTimeout(() => this.cargar(), 300);
  }
}
