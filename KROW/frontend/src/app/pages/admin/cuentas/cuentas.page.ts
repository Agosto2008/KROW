import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CuentaService } from '../../../services/cuenta.service';
import { ToastService } from '../../../shader/toast/toast.service';
import { Cuenta, EstadoCuenta } from '../../../models/Index';
import { BadgeComponent } from '../../../shader/badge/badge.component';
import { BotonComponent } from '../../../shader/boton/boton.component';
import { CampoInputComponent } from '../../../shader/campo-input/campo-input.component';

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
  readonly cuentaBuscada = signal<Cuenta | null>(null);
  idBuscar: number | null = null;

  ngOnInit(): void {}

  buscar(): void {
    if (!this.idBuscar) return;
    this.cargando.set(true);
    this.cuentaService.obtenerPorId(this.idBuscar).subscribe({
      next: (c) => { this.cuentaBuscada.set(c); this.cargando.set(false); },
      error: () => {
        this.cargando.set(false);
        this.cuentaBuscada.set(null);
        this.toast.error('Cuenta no encontrada');
      },
    });
  }

  cambiarEstado(estado: EstadoCuenta): void {
    const c = this.cuentaBuscada();
    if (!c) return;
    this.cuentaService.cambiarEstado(c.id_cuenta, estado).subscribe({
      next: () => {
        this.toast.exito(`Estado cambiado a ${estado}`);
        this.cuentaBuscada.set({ ...c, estado });
      },
      error: () => this.toast.error('No se pudo cambiar el estado'),
    });
  }

  getVarianteEstado(estado: string): any {
    const mapa: Record<string, string> = {
      ACTIVA: 'estado-activa', INACTIVA: 'estado-pendiente', SUSPENDIDA: 'estado-rechazada',
    };
    return mapa[estado] ?? 'neutro';
  }
}