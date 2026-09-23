import { Component, inject, signal, computed, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { PropuestaService } from '../../../core/api/propuesta.service';
import { FavoritoService } from '../../../core/api/favorito.service';
import { AuthService } from '../../../core/api/auth.service';
import { ToastService } from '../../../shared/toast/toast.service';
import { PropuestaConEmpresa } from '../../../core/models/Index';
import { PropuestaCardComponent } from '../../../shared/propuesta-card/propuesta-card.component';
import { EmptyStateComponent } from '../../../shared/empty-state/empty-state.component';
import { SpinnerComponent } from '../../../shared/spinner/spinner.component';
import { BotonComponent } from '../../../shared/boton/boton.component';

/** 'TODOS' no viaja al backend: el resto son los enums exactos de `Propuesta.tipo` */
type FiltroTipo = 'TODOS' | 'PREPRACTICA' | 'PRACTICA' | 'PASANTIA' | 'TRABAJO';

interface TabTipo {
  clave: FiltroTipo;
  etiqueta: string;
}

/**
 * Explorar ofertas.
 *
 * TODOS los filtros (texto, tipo, modalidad) se aplican en el SERVIDOR,
 * así la paginación es honesta: el `total` que ves corresponde a lo que
 * realmente hay con esos filtros aplicados.
 */
@Component({
  selector: 'app-explorar-page',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterLink,
    PropuestaCardComponent,
    EmptyStateComponent,
    SpinnerComponent,
    BotonComponent,
  ],
  templateUrl: './explorar.page.html',
  styleUrl: './explorar.page.css',
})
export class ExplorarPage implements OnInit {
  private readonly propuestaService = inject(PropuestaService);
  private readonly favoritoService = inject(FavoritoService);
  private readonly auth = inject(AuthService);
  private readonly toast = inject(ToastService);
  private readonly route = inject(ActivatedRoute);

  readonly tabs: TabTipo[] = [
    { clave: 'TODOS', etiqueta: 'Todo' },
    { clave: 'PREPRACTICA', etiqueta: 'Preprácticas' },
    { clave: 'PRACTICA', etiqueta: 'Prácticas' },
    { clave: 'PASANTIA', etiqueta: 'Pasantías' },
    { clave: 'TRABAJO', etiqueta: 'Trabajos' },
  ];

  /** Filas con la empresa ya embebida: sin lookup de empresas aparte */
  readonly propuestas = signal<PropuestaConEmpresa[]>([]);
  readonly favoritados = signal<Set<number>>(new Set());
  readonly cargando = signal(true);

  readonly pagina = signal(1);
  readonly total = signal(0);
  readonly porPagina = 12;

  // Filtros (el backend pagina y filtra en el servidor)
  readonly busqueda = signal('');
  readonly filtroTipo = signal<FiltroTipo>('TODOS');
  readonly filtroModalidad = signal('');

  readonly totalPaginas = computed(() =>
    Math.max(1, Math.ceil(this.total() / this.porPagina))
  );

  ngOnInit(): void {
    // Enlace desde la landing: /propuestas?tipo=PRACTICA
    const tipoInicial = this.route.snapshot.queryParamMap.get('tipo');
    if (tipoInicial && this.esTipoValido(tipoInicial)) {
      this.filtroTipo.set(tipoInicial as FiltroTipo);
    }

    this.cargar();
    this.cargarFavoritos();
  }

  private esTipoValido(valor: string): boolean {
    return this.tabs.some((t) => t.clave === valor);
  }

  private cargar(): void {
    this.cargando.set(true);

    const filtros: Record<string, string | number> = {
      estado: 'ACTIVA',
      pagina: this.pagina(),
      por_pagina: this.porPagina,
    };
    if (this.busqueda().trim()) filtros['buscar'] = this.busqueda().trim();
    if (this.filtroModalidad()) filtros['modalidad'] = this.filtroModalidad();
    if (this.filtroTipo() !== 'TODOS') filtros['tipo'] = this.filtroTipo();

    this.propuestaService.buscar(filtros).subscribe({
      next: (res) => {
        this.propuestas.set(res.datos);
        this.total.set(res.total);
        this.cargando.set(false);
      },
      error: () => this.cargando.set(false),
    });
  }

  private cargarFavoritos(): void {
    const idUsuario = this.auth.idUsuario();
    if (!idUsuario) return;
    this.favoritoService.listar(idUsuario).subscribe({
      next: (favs) => this.favoritados.set(new Set(favs.map((f) => f.id_propuesta))),
      error: () => {},
    });
  }

  esFavorito(propuestaId: number): boolean {
    return this.favoritados().has(propuestaId);
  }

  onToggleFavorito(propuestaId: number): void {
    if (this.auth.rol() !== 'USUARIO') {
      this.toast.info('Inicia sesión como candidato para guardar ofertas');
      return;
    }

    this.favoritoService.alternar(propuestaId).subscribe({
      next: (res) => {
        const ahoraFav = res.mensaje === 'agregado';
        this.favoritados.update((set) => {
          const nuevo = new Set(set);
          if (ahoraFav) nuevo.add(propuestaId);
          else nuevo.delete(propuestaId);
          return nuevo;
        });
        this.toast.exito(ahoraFav ? 'Guardado' : 'Eliminado de guardados');
      },
      error: () => this.toast.error('No se pudo actualizar el favorito'),
    });
  }

  aplicarFiltroTexto(event: Event): void {
    const valor = (event.target as HTMLInputElement).value;
    this.busqueda.set(valor);
    this.pagina.set(1);
    this.debounceBuscar();
  }

  private timer: ReturnType<typeof setTimeout> | null = null;

  private debounceBuscar(): void {
    if (this.timer) clearTimeout(this.timer);
    this.timer = setTimeout(() => this.cargar(), 300);
  }

  /** Cambiar de tab siempre vuelve a la página 1 */
  setTipo(t: FiltroTipo): void {
    if (this.filtroTipo() === t) return;
    this.filtroTipo.set(t);
    this.pagina.set(1);
    this.cargar();
  }

  setModalidad(event: Event): void {
    this.filtroModalidad.set((event.target as HTMLSelectElement).value);
    this.pagina.set(1);
    this.cargar();
  }

  /** Hay filtros activos? Para ofrecer "limpiar filtros" en el estado vacío */
  hayFiltros(): boolean {
    return this.busqueda().trim() !== '' || this.filtroTipo() !== 'TODOS' || this.filtroModalidad() !== '';
  }

  limpiarFiltros(): void {
    this.busqueda.set('');
    this.filtroTipo.set('TODOS');
    this.filtroModalidad.set('');
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
}
