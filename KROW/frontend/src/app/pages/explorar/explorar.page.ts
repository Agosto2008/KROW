import { Component, inject, signal, computed, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PropuestaService, FiltrosPropuesta } from '../../services/propuesta.service';
import { EmpresaService } from '../../services/empresa.service';
import { FavoritoService } from '../../services/favorito.service';
import { TokenStorageService } from '../../core/token-storage.service';
import { ToastService } from '../../shader/toast/toast.service';
import { Propuesta, Empresa, Favorito } from '../../models/Index';
import { PropuestaCardComponent } from '../../shader/propuesta-card/propuesta-card.component';
import { EmptyStateComponent } from '../../shader/empty-state/empty-state.component';
import { SpinnerComponent } from '../../shader/spinner/spinner.component';

type FiltroTipo = 'TODOS' | 'TRABAJO' | 'PRACTICA';

@Component({
  selector: 'app-explorar-page',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    PropuestaCardComponent,
    EmptyStateComponent,
    SpinnerComponent,
  ],
  templateUrl: './explorar.page.html',
  styleUrl: './explorar.page.css',
})
export class ExplorarPage implements OnInit {
  private readonly propuestaService = inject(PropuestaService);
  private readonly empresaService = inject(EmpresaService);
  private readonly favoritoService = inject(FavoritoService);
  private readonly tokenStorage = inject(TokenStorageService);
  private readonly toast = inject(ToastService);

  readonly propuestas = signal<Propuesta[]>([]);
  readonly empresas = signal<Empresa[]>([]);
  readonly favoritos = signal<Favorito[]>([]);
  readonly cargando = signal(true);

  // Filtros
  readonly busqueda = signal('');
  readonly filtroTipo = signal<FiltroTipo>('TODOS');
  readonly filtroModalidad = signal<string>('');
  readonly filtroSector = signal<string>('');

  readonly propuestasFiltradas = computed(() => {
    const q = this.busqueda().toLowerCase().trim();
    const tipo = this.filtroTipo();
    const modalidad = this.filtroModalidad();

    return this.propuestas().filter((p) => {
      // Tipo
      if (tipo === 'TRABAJO' && p.tipo !== 'TRABAJO') return false;
      if (tipo === 'PRACTICA' && p.tipo === 'TRABAJO') return false;

      // Modalidad
      if (modalidad && p.modalidad !== modalidad) return false;

      // Búsqueda por nombre, empresa o ubicación
      if (q) {
        const empresa = this.empresas().find((e) => e.id_empresa === p.empresa_id);
        const texto = `${p.nombre} ${empresa?.nombre ?? ''} ${p.ubicacion ?? ''}`.toLowerCase();
        if (!texto.includes(q)) return false;
      }

      return true;
    });
  });

  ngOnInit(): void {
    this.cargarTodo();
  }

  private cargarTodo(): void {
    this.empresaService.listar().subscribe({
      next: (empresas) => this.empresas.set(empresas),
      error: () => {},
    });

    this.propuestaService.listar({ estado: 'ACTIVA' }).subscribe({
      next: (propuestas) => {
        this.propuestas.set(propuestas);
        this.cargando.set(false);
      },
      error: () => this.cargando.set(false),
    });

    const idUsuario = this.tokenStorage.obtenerIdCuenta();
    if (idUsuario) {
      this.favoritoService.listar(idUsuario).subscribe({
        next: (favoritos) => this.favoritos.set(favoritos),
        error: () => {},
      });
    }
  }

  // Helpers de empresa
  nombreEmpresa(id: number): string {
    return this.empresas().find((e) => e.id_empresa === id)?.nombre ?? 'Empresa';
  }
  fotoEmpresa(id: number): string | null {
    return this.empresas().find((e) => e.id_empresa === id)?.fotografia ?? null;
  }
  verifEmpresa(id: number): boolean {
    return this.empresas().find((e) => e.id_empresa === id)?.verificada ?? false;
  }

  esFavorito(propuestaId: number): boolean {
    return this.favoritos().some((f) => f.propuesta_id === propuestaId);
  }

  onToggleFavorito(propuestaId: number): void {
    const idUsuario = this.tokenStorage.obtenerIdCuenta();
    if (!idUsuario) {
      this.toast.info('Inicia sesión para guardar ofertas');
      return;
    }

    this.favoritoService.alternar(idUsuario, propuestaId).subscribe({
      next: (res) => {
        if (res.mensaje === 'agregado') {
          this.favoritos.update((f) => [
            ...f,
            { id_favorito: 0, usuario_id: idUsuario, propuesta_id: propuestaId, fecha: '' },
          ]);
          this.toast.exito('Guardado en favoritos');
        } else {
          this.favoritos.update((f) => f.filter((x) => x.propuesta_id !== propuestaId));
          this.toast.info('Eliminado de favoritos');
        }
      },
      error: () => this.toast.error('No se pudo actualizar el favorito'),
    });
  }

  setTipo(t: FiltroTipo): void { this.filtroTipo.set(t); }
}