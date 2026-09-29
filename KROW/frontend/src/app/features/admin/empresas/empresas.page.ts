import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { EmpresaService } from '../../../core/api/empresa.service';
import { Empresa } from '../../../core/models/Index';
import { BadgeComponent } from '../../../shared/badge/badge.component';
import { BotonComponent } from '../../../shared/boton/boton.component';
import { SpinnerComponent } from '../../../shared/spinner/spinner.component';
import { EmptyStateComponent } from '../../../shared/empty-state/empty-state.component';

@Component({
  selector: 'app-admin-empresas-page',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, BadgeComponent, BotonComponent, SpinnerComponent, EmptyStateComponent],
  templateUrl: './empresas.page.html',
  styleUrl: './empresas.page.css',
})
export class AdminEmpresasPage implements OnInit {
  private readonly empresaService = inject(EmpresaService);

  readonly empresas = signal<Empresa[]>([]);
  readonly cargando = signal(true);
  busqueda = '';

  ngOnInit(): void {
    this.empresaService.listar().subscribe({
      next: (e) => { this.empresas.set(e); this.cargando.set(false); },
      error: () => this.cargando.set(false),
    });
  }

  get filtradas(): Empresa[] {
    const q = this.busqueda.toLowerCase().trim();
    if (!q) return this.empresas();
    return this.empresas().filter((e) =>
      `${e.nombre} ${e.ubicacion ?? ''}`.toLowerCase().includes(q)
    );
  }
}