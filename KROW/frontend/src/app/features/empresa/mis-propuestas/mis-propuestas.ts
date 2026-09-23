import { Component, inject, signal, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { PropuestaService } from '../../../core/services/propuesta.service';
import { EmpresaService } from '../../../core/services/empresa.service';
import { Propuesta } from '../../../core/models/propuesta.model';

const ID_CUENTA = () => Number(localStorage.getItem('krow_id_cuenta'));

@Component({
    selector: 'app-mis-propuestas',
    imports: [RouterLink],
    templateUrl: './mis-propuestas.html'
})
export class MisPropuestas implements OnInit {
    private propuestaSvc = inject(PropuestaService);
    private empresaSvc = inject(EmpresaService);

    propuestas = signal<Propuesta[]>([]);
    cargando = signal(true);

    ngOnInit() {
        // 1) Averiguar qué empresa es la cuenta logueada
        // 2) Pedir las propuestas de esa empresa
        this.empresaSvc.listar().subscribe({
            next: (empresas) => {
                // El backend no expone /empresas/mi-perfil, así que filtramos por cuenta_id
                // (solución simple; si agregas ese endpoint, mejor)
                const cuentaId = ID_CUENTA();
                const mia = empresas.find(e => e.cuenta_id === cuentaId);
                if (!mia) { this.cargando.set(false); return; }
                this.propuestaSvc.listar({ empresa_id: String(mia.id_empresa) }).subscribe({
                    next: (data) => { this.propuestas.set(data); this.cargando.set(false); },
                    error: () => this.cargando.set(false)
                });
            },
            error: () => this.cargando.set(false)
        });
    }

    eliminar(id: number) {
        if (!confirm('¿Eliminar esta propuesta?')) return;
        this.propuestaSvc.eliminar(id).subscribe(() => {
            this.propuestas.update(arr => arr.filter(p => p.id_propuesta !== id));
        });
    }
}