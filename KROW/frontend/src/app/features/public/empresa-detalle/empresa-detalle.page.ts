import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { EmpresaService } from '../../../core/api/empresa.service';
import { EmpresaConPropuestas } from '../../../core/models/Index';
import { PropuestaCardComponent } from '../../../shared/propuesta-card/propuesta-card.component';
import { AvatarEmpresaComponent } from '../../../shared/avatar-empresa/avatar-empresa.component';
import { BadgeComponent } from '../../../shared/badge/badge.component';
import { EmptyStateComponent } from '../../../shared/empty-state/empty-state.component';
import { SpinnerComponent } from '../../../shared/spinner/spinner.component';

/**
 * Perfil público de una empresa + sus ofertas activas.
 * 1 sola petición: GET /empresas/:id/con-propuestas.
 */
@Component({
  selector: 'app-empresa-detalle-page',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    PropuestaCardComponent,
    AvatarEmpresaComponent,
    BadgeComponent,
    EmptyStateComponent,
    SpinnerComponent,
  ],
  templateUrl: './empresa-detalle.page.html',
  styleUrls: ['./empresa-detalle.page.css', '../../../shared/estilos/pagina.css'],
})
export class EmpresaDetallePage implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly empresaService = inject(EmpresaService);

  readonly empresa = signal<EmpresaConPropuestas | null>(null);
  readonly cargando = signal(true);

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    if (!id) {
      this.router.navigate(['/empresas']);
      return;
    }

    this.empresaService.obtenerConPropuestas(id).subscribe({
      next: (empresa) => {
        this.empresa.set(empresa);
        this.cargando.set(false);
      },
      error: () => {
        this.cargando.set(false);
        this.router.navigate(['/empresas']);
      },
    });
  }
}
