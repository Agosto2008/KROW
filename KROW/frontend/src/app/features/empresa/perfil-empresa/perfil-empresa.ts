import { Component, inject, signal, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { EmpresaService } from '../../../core/services/empresa.service';
import { AuthService } from '../../../core/services/auth.service';
import { Empresa } from '../../../core/models/empresa.model';

@Component({
    selector: 'app-perfil-empresa',
    imports: [FormsModule],
    template: `
    <div class="card form-card">
      <h1>Mi empresa</h1>
      @if (cargando()) {
        <p>Cargando...</p>
      } @else if (!form.id_empresa) {
        <p>No se encontró el perfil de empresa.</p>
      } @else {
        <div class="field"><label>Nombre</label><input [(ngModel)]="form.nombre" /></div>
        <div class="field"><label>Descripción</label><textarea rows="4" [(ngModel)]="form.descripcion"></textarea></div>
        <div class="field"><label>Propuesta de valor</label><textarea rows="3" [(ngModel)]="form.propuesta_empresa"></textarea></div>
        <div class="field"><label>Teléfono</label><input [(ngModel)]="form.telefono" /></div>
        <div class="field"><label>Ubicación</label><input [(ngModel)]="form.ubicacion" /></div>

        <p class="verif">
          Verificación:
          <strong>{{ form.verificada ? 'Verificada ✅' : 'Sin verificar' }}</strong>
        </p>

        @if (guardado()) { <p class="ok">✅ Cambios guardados</p> }

        <button class="btn" (click)="guardar()">Guardar</button>
      }
    </div>
  `,
    styles: [`
    .form-card { max-width: 720px; }
    .ok { color: #059669; font-weight: 600; }
    .verif { font-size: 14px; color: #4b5563; }
  `]
})
export class PerfilEmpresa implements OnInit {
    private svc = inject(EmpresaService);
    private auth = inject(AuthService);

    form: Partial<Empresa> = {};
    cargando = signal(true);
    guardado = signal(false);

    ngOnInit() {
        // /auth/me devuelve el perfil (empresa) asociado a la cuenta logueada
        this.auth.me().subscribe({
            next: (me) => {
                this.form = { ...(me.perfil ?? {}) };
                this.cargando.set(false);
            },
            error: () => this.cargando.set(false)
        });
    }

    guardar() {
        if (!this.form.id_empresa) return;
        this.guardado.set(false);
        this.svc.actualizar(this.form.id_empresa, this.form).subscribe(() => {
            this.guardado.set(true);
            setTimeout(() => this.guardado.set(false), 2500);
        });
    }
}