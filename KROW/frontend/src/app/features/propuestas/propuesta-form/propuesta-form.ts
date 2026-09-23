import { Component, inject, signal, OnInit, input } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { PropuestaService } from '../../../core/services/propuesta.service';
import { TipoPropuesta, ModalidadPropuesta } from '../../../core/models/propuesta.model';

@Component({
    selector: 'app-propuesta-form',
    imports: [FormsModule],
    templateUrl: './propuesta-form.html'
})
export class PropuestaForm implements OnInit {
    // :id es opcional (undefined = crear, definido = editar)
    id = input<string>();

    private svc = inject(PropuestaService);
    private router = inject(Router);

    tipos: TipoPropuesta[] = ['PREPRACTICA', 'PRACTICA', 'PASANTIA', 'TRABAJO'];
    modalidades: ModalidadPropuesta[] = ['PRESENCIAL', 'REMOTO', 'HIBRIDO'];

    form = {
        nombre: '',
        descripcion: '',
        tipo: 'PRACTICA' as TipoPropuesta,
        modalidad: 'PRESENCIAL' as ModalidadPropuesta,
        pago: null as number | null,
        ubicacion: '',
        vacantes: 1,
        fecha_vencimiento: ''
    };

    error = signal<string | null>(null);
    cargando = signal(false);
    editando = signal(false);

    ngOnInit() {
        const id = this.id();
        if (id) {
            this.editando.set(true);
            this.svc.obtener(Number(id)).subscribe(p => {
                this.form = {
                    nombre: p.nombre,
                    descripcion: p.descripcion,
                    tipo: p.tipo,
                    modalidad: p.modalidad,
                    pago: p.pago,
                    ubicacion: p.ubicacion ?? '',
                    vacantes: p.vacantes,
                    fecha_vencimiento: p.fecha_vencimiento ?? ''
                };
            });
        }
    }

    onSubmit() {
        this.error.set(null);
        this.cargando.set(true);

        const data: any = { ...this.form };
        if (!data.fecha_vencimiento) data.fecha_vencimiento = null;
        if (!data.pago) data.pago = null;

        const obs = this.editando()
            ? this.svc.actualizar(Number(this.id()), data)
            : this.svc.crear(data);

        obs.subscribe({
            next: () => this.router.navigate(['/mis-propuestas']),
            error: (e) => { this.error.set(e.error?.mensaje || 'Error'); this.cargando.set(false); }
        });
    }
}