import { Component, inject, signal, OnInit } from '@angular/core';
import { EmpresaService } from '../../../core/services/empresa.service';
import { VerificacionEmpresaService } from '../../../core/services/verificacion-empresa.service';
import { Empresa } from '../../../core/models/empresa.model';
import { VerificacionEmpresa } from '../../../core/models/verificacion-empresa.model';

@Component({
    selector: 'app-verificaciones',
    imports: [],
    templateUrl: './verificaciones.html'
})
export class Verificaciones implements OnInit {
    private empresaSvc = inject(EmpresaService);
    private verSvc = inject(VerificacionEmpresaService);

    empresas = signal<Empresa[]>([]);
    solicitudesPorEmpresa = signal<Record<number, VerificacionEmpresa[]>>({});
    cargando = signal(true);

    ngOnInit() {
        this.empresaSvc.listar().subscribe(async empresas => {
            this.empresas.set(empresas);

            const mapa: Record<number, VerificacionEmpresa[]> = {};
            for (const emp of empresas) {
                try {
                    const vs = await this.verSvc.listarPorEmpresa(emp.id_empresa).toPromise();
                    const pendientes = (vs ?? []).filter(v => v.estado === 'PENDIENTE');
                    if (pendientes.length > 0) mapa[emp.id_empresa] = pendientes;
                } catch { /* ignore */ }
            }
            this.solicitudesPorEmpresa.set(mapa);
            this.cargando.set(false);
        });
    }

    resolver(id: number, aprobada: boolean) {
        this.verSvc.resolver(id, aprobada ? 'APROBADA' : 'RECHAZADA').subscribe(() => {
            const actual = { ...this.solicitudesPorEmpresa() };
            for (const key in actual) {
                actual[key] = actual[key].filter(v => v.id_verificacion !== id);
                if (actual[key].length === 0) delete actual[key];
            }
            this.solicitudesPorEmpresa.set(actual);
        });
    }

    hayPendientes(): boolean {
        return Object.keys(this.solicitudesPorEmpresa()).length > 0;
    }
}