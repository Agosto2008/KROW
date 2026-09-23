import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FavoritoService } from '../../../services/favorito.service';
import { PropuestaService } from '../../../services/propuesta.service';
import { EmpresaService } from '../../../services/empresa.service';
import { TokenStorageService } from '../../../core/token-storage.service';
import { ToastService } from '../../../shader/toast/toast.service';
import { Propuesta, Empresa, Favorito } from '../../../models/Index';
import { PropuestaCardComponent } from '../../../shader/propuesta-card/propuesta-card.component';
import { EmptyStateComponent } from '../../../shader/empty-state/empty-state.component';
import { SpinnerComponent } from '../../../shader/spinner/spinner.component';

@Component({
  selector: 'app-guardados-page',
  standalone: true,
  imports: [CommonModule, RouterLink, PropuestaCardComponent, EmptyStateComponent, SpinnerComponent],
  templateUrl: './guardados.page.html',
  styleUrl: './guardados.page.css',
})
export class GuardadosPage implements OnInit {
  private readonly favoritoService = inject(FavoritoService);
  private readonly propuestaService = inject(PropuestaService);
  private readonly empresaService = inject(EmpresaService);
  private readonly tokenStorage = inject(TokenStorageService);
  private readonly toast = inject(ToastService);

  readonly propuestas = signal<Propuesta[]>([]);
  readonly empresas = signal<Empresa[]>([]);
  readonly cargando = signal(true);

  ngOnInit(): void {
    const id = this.tokenStorage.obtenerIdCuenta();
    if (!id) return;

    this.empresaService.listar().subscribe({
      next: (emps) => this.empresas.set(emps),
      error: () => {},
    });

    this.favoritoService.listar(id).subscribe({
      next: (favs) => {
        favs.forEach((f) => {
          this.propuestaService.obtenerPorId(f.propuesta_id).subscribe({
            next: (p) => this.propuestas.update((lista) => [...lista, p]),
            error: () => {},
          });
        });
        setTimeout(() => this.cargando.set(false), 300);
      },
      error: () => this.cargando.set(false),
    });
  }

  nombreEmpresa(id: number): string {
    return this.empresas().find((e) => e.id_empresa === id)?.nombre ?? 'Empresa';
  }
  fotoEmpresa(id: number): string | null {
    return this.empresas().find((e) => e.id_empresa === id)?.fotografia ?? null;
  }
  verifEmpresa(id: number): boolean {
    return this.empresas().find((e) => e.id_empresa === id)?.verificada ?? false;
  }

  onQuitar(propuestaId: number): void {
    const id = this.tokenStorage.obtenerIdCuenta();
    if (!id) return;
    this.favoritoService.alternar(id, propuestaId).subscribe({
      next: () => {
        this.propuestas.update((lista) => lista.filter((p) => p.id_propuesta !== propuestaId));
        this.toast.info('Eliminado de guardados');
      },
      error: () => this.toast.error('No se pudo quitar'),
    });
  }
}