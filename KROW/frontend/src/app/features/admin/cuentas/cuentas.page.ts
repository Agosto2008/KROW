import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CuentaService } from '../../../core/api/cuenta.service';
import { ToastService } from '../../../shared/toast/toast.service';
import { CuentaResumen, EstadoCuenta } from '../../../core/models/Index';
import { BadgeComponent, VarianteBadge } from '../../../shared/badge/badge.component';
import { BotonComponent } from '../../../shared/boton/boton.component';
import { CampoInputComponent } from '../../../shared/campo-input/campo-input.component';

@Component({
  selector: 'app-admin-cuentas-page',
  standalone: true,
  imports: [CommonModule, FormsModule, BadgeComponent, BotonComponent, CampoInputComponent],
  templateUrl: './cuentas.page.html',
  styleUrl: './cuentas.page.css',
})
export class AdminCuentasPage implements OnInit {
  private readonly cuentaService = inject(CuentaService);
  private readonly toast = inject(ToastService);

  readonly cargando = signal(false);
  readonly cuentas = signal<CuentaResumen[]>([]);
  readonly total = signal(0);
  readonly pagina = signal(1);
  readonly termino = signal('');
  readonly porPagina = 15;

  ngOnInit(): void {
    this.cargar();
  }

  buscar(termino: string): void {
    this.termino.set(termino.trim());
    this.pagina.set(1);
    this.cargar();
  }

  private cargar(): void {
    this.cargando.set(true);
    this.cuentaService.listar({
      buscar: this.termino(),
      pagina: this.pagina(),
    }).subscribe({
      next: (res) => {
        this.cuentas.set(res.datos);
        this.total.set(res.total);
        this.cargando.set(false);
      },
      error: () => {
        this.cargando.set(false);
        this.toast.error('No se pudieron cargar las cuentas');
      },
    });
  }

  get totalPaginas(): number {
    return Math.max(1, Math.ceil(this.total() / this.porPagina));
  }

  cambiarPagina(delta: number): void {
    const nueva = this.pagina() + delta;
    if (nueva < 1 || nueva > this.totalPaginas) return;
    this.pagina.set(nueva);
    this.cargar();
  }

  cambiarEstado(c: CuentaResumen, estado: EstadoCuenta): void {
    this.cuentaService.cambiarEstado(c.id_cuenta, estado).subscribe({
      next: () => {
        this.toast.exito(`Estado cambiado a ${estado}`);
        this.cuentas.update((lista) =>
          lista.map((x) => (x.id_cuenta === c.id_cuenta ? { ...x, estado } : x))
        );
      },
      error: () => this.toast.error('No se pudo cambiar el estado'),
    });
  }

  nombreCuenta(c: CuentaResumen): string {
    if (c.rol === 'EMPRESA') return c.empresa_nombre ?? 'Empresa';
    if (c.rol === 'USUARIO') {
      return [c.primer_nombre, c.segundo_nombre, c.primer_apellido, c.segundo_apellido]
        .filter(Boolean).join(' ') || 'Usuario';
    }
    return 'Administrador';
  }

  getVarianteEstado(estado: string): VarianteBadge {
    const mapa: Record<string, VarianteBadge> = {
      ACTIVA: 'estado-activa',
      PAUSADA: 'estado-pausada',
      CERRADA: 'estado-cerrada',
      VENCIDA: 'estado-vencida',
      PENDIENTE: 'estado-pendiente',
      EN_REVISION: 'estado-revision',
      ACEPTADA: 'estado-aceptada',
      RECHAZADA: 'estado-rechazada',
      CANCELADA: 'estado-cancelada',
      SUSPENDIDA: 'estado-rechazada',
      INACTIVA: 'estado-pendiente',
      PROGRAMADA: 'estado-pendiente',
      REPROGRAMADA: 'estado-revision',
      REALIZADA: 'estado-aceptada',
      APROBADA: 'estado-aceptada',
    };
    return mapa[estado] ?? 'neutro';
  }

  getVarianteRol(rol: string): VarianteBadge {
    const mapa: Record<string, VarianteBadge> = {
      ADMIN: 'verificada',
      USUARIO: 'tipo',
      EMPRESA: 'modalidad',
    };
    return mapa[rol] ?? 'neutro';
  }
}
