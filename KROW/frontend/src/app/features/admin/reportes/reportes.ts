import { DatePipe } from '@angular/common';
import { Component, inject, signal, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ReporteService } from '../../../core/services/reporte.service';
import { EstadoReporte, Reporte } from '../../../core/models/reporte.model';

@Component({
    selector: 'app-reportes',
    imports: [FormsModule, DatePipe],
    templateUrl: './reportes.html'
})
export class Reportes implements OnInit {
    private svc = inject(ReporteService);

    reportes = signal<Reporte[]>([]);
    estados: EstadoReporte[] = ['PENDIENTE', 'EN_REVISION', 'RESUELTO', 'DESCARTADO'];
    filtro = '' as '' | EstadoReporte;

    ngOnInit() { this.cargar(); }

    cargar() {
        this.svc.listar(this.filtro || undefined).subscribe(d => this.reportes.set(d));
    }

    // Recibe string (viene del <select>) y lo castea al tipo correcto
    cambiarEstadoDesdeSelect(id: number, valor: string) {
        this.svc.cambiarEstado(id, valor as EstadoReporte).subscribe(() => this.cargar());
    }
}