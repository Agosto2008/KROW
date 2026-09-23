import { Component, inject, signal, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CurriculumService } from '../../../core/services/curriculum.service';
import { AuthService } from '../../../core/services/auth.service';
import { Curriculum } from '../../../core/models/curriculum.model';

@Component({
    selector: 'app-curriculum-form',
    imports: [FormsModule],
    templateUrl: './curriculum-form.html'
})
export class CurriculumForm implements OnInit {
    private svc = inject(CurriculumService);
    private auth = inject(AuthService);

    usuarioId = 0;
    form: Partial<Curriculum> = {
        perfil_profesional: '', campo_laboral: '', campo_estudiantil: '',
        fortalezas: '', debilidades: '', idiomas: '', habilidades: '',
        certificaciones: '', portafolio: ''
    };

    cargando = signal(true);
    guardado = signal(false);

    ngOnInit() {
        this.auth.me().subscribe(me => {
            if (!me.perfil?.id_usuario) { this.cargando.set(false); return; }
            this.usuarioId = me.perfil.id_usuario;
            this.svc.obtener(this.usuarioId).subscribe({
                next: (cv) => { this.form = { ...cv }; this.cargando.set(false); },
                error: () => this.cargando.set(false) // 404 = aún no tiene CV
            });
        });
    }

    guardar() {
        this.guardado.set(false);
        this.svc.guardar(this.usuarioId, this.form).subscribe(() => {
            this.guardado.set(true);
            setTimeout(() => this.guardado.set(false), 2500);
        });
    }
}