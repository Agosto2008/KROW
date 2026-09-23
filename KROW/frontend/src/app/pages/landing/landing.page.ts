import { Component, inject, signal, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { PropuestaService } from '../../services/propuesta.service';
import { EmpresaService } from '../../services/empresa.service';
import { Propuesta, Empresa } from '../../models/Index';
import { BotonComponent } from '../../shader/boton/boton.component';
import { BadgeComponent } from '../../shader/badge/badge.component';
import { SpinnerComponent } from '../../shader/spinner/spinner.component';

@Component({
  selector: 'app-landing-page',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    BotonComponent,
    BadgeComponent,
    SpinnerComponent,
  ],
  templateUrl: './landing.page.html',
  styleUrl: './landing.page.css',
})
export class LandingPage implements OnInit {
  private readonly propuestaService = inject(PropuestaService);
  private readonly empresaService = inject(EmpresaService);

  readonly propuestasDestacadas = signal<Propuesta[]>([]);
  readonly empresas = signal<Empresa[]>([]);
  readonly cargando = signal(true);

  ngOnInit(): void {
    this.cargarDatos();
  }

  private cargarDatos(): void {
    this.empresaService.listar().subscribe({
      next: (empresas) => this.empresas.set(empresas),
      error: () => {},
    });

    this.propuestaService.listar({ estado: 'ACTIVA' }).subscribe({
      next: (propuestas) => {
        this.propuestasDestacadas.set(propuestas.slice(0, 3));
        this.cargando.set(false);
      },
      error: () => this.cargando.set(false),
    });
  }

  nombreEmpresa(empresaId: number): string {
    return this.empresas().find((e) => e.id_empresa === empresaId)?.nombre ?? 'Empresa';
  }

  fotoEmpresa(empresaId: number): string | null {
    return this.empresas().find((e) => e.id_empresa === empresaId)?.fotografia ?? null;
  }

  empresaVerificada(empresaId: number): boolean {
    return this.empresas().find((e) => e.id_empresa === empresaId)?.verificada ?? false;
  }
}