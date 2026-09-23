import { Component, inject, signal, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { UsuarioService } from '../../../core/services/usuario.service';
import { AuthService } from '../../../core/services/auth.service';
import { Usuario } from '../../../core/models/usuario.model';

@Component({
    selector: 'app-perfil-usuario',
    imports: [FormsModule],
    template: `
    <div class="card form-card">
      <h1>Mi perfil</h1>
      @if (cargando()) {
        <p>Cargando...</p>
      } @else if (!form.id_usuario) {
        <p>No se encontró el perfil de usuario.</p>
      } @else {
        <div class="two-cols">
          <div class="field"><label>Primer nombre</label><input [(ngModel)]="form.primer_nombre" /></div>
          <div class="field"><label>Segundo nombre</label><input [(ngModel)]="form.segundo_nombre" /></div>
        </div>
        <div class="two-cols">
          <div class="field"><label>Primer apellido</label><input [(ngModel)]="form.primer_apellido" /></div>
          <div class="field"><label>Segundo apellido</label><input [(ngModel)]="form.segundo_apellido" /></div>
        </div>
        <div class="field"><label>Teléfono</label><input [(ngModel)]="form.telefono" /></div>
        <div class="field"><label>Dirección</label><input [(ngModel)]="form.direccion" /></div>
        <div class="field"><label>Fecha de nacimiento</label><input type="date" [(ngModel)]="form.fecha_nacimiento" /></div>
        <div class="field"><label>Descripción personal</label><textarea rows="3" [(ngModel)]="form.descripcion_personal"></textarea></div>
        <div class="field"><label>Fotografía (URL)</label><input [(ngModel)]="form.fotografia" /></div>

        @if (guardado()) { <p class="ok">✅ Cambios guardados</p> }

        <button class="btn" (click)="guardar()">Guardar</button>
      }
    </div>
  `,
    styles: [`
    .form-card { max-width: 720px; }
    .two-cols { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; }
    .ok { color: #059669; font-weight: 600; }
  `]
})
export class PerfilUsuario implements OnInit {
    private svc = inject(UsuarioService);
    private auth = inject(AuthService);

    form: Partial<Usuario> = {};
    cargando = signal(true);
    guardado = signal(false);

    ngOnInit() {
        this.auth.me().subscribe({
            next: (me) => {
                this.form = { ...(me.perfil ?? {}) };
                this.cargando.set(false);
            },
            error: () => this.cargando.set(false)
        });
    }

    guardar() {
        if (!this.form.id_usuario) return;
        this.guardado.set(false);
        this.svc.actualizar(this.form.id_usuario, this.form).subscribe(() => {
            this.guardado.set(true);
            setTimeout(() => this.guardado.set(false), 2500);
        });
    }
}