import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { PropuestaService } from '../../../services/propuesta.service';
import { EmpresaService } from '../../../services/empresa.service';
import { TokenStorageService } from '../../../core/token-storage.service';
import { ToastService } from '../../../shader/toast/toast.service';
import { Empresa } from '../../../models/Index';
import { CampoInputComponent } from '../../../shader/campo-input/campo-input.component';
import { CampoTextareaComponent } from '../../../shader/campo-textarea/campo-textarea.component';
import { CampoSelectComponent, OpcionSelect } from '../../../shader/campo-select/campo-select.component';
import { BotonComponent } from '../../../shader/boton/boton.component';
import { SpinnerComponent } from '../../../shader/spinner/spinner.component';

@Component({
  selector: 'app-propuesta-form-page',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink, CampoInputComponent, CampoTextareaComponent, CampoSelectComponent, BotonComponent, SpinnerComponent],
  templateUrl: './propuesta-form.page.html',
  styleUrl: './propuesta-form.page.css',
})
export class PropuestaFormPage implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly propuestaService = inject(PropuestaService);
  private readonly empresaService = inject(EmpresaService);
  private readonly tokenStorage = inject(TokenStorageService);
  private readonly toast = inject(ToastService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);

  readonly esEdicion = signal(false);
  readonly cargando = signal(true);
  readonly guardando = signal(false);
  readonly empresa = signal<Empresa | null>(null);
  private idPropuesta: number | null = null;

  readonly tipos: OpcionSelect[] = [
    { valor: 'PREPRACTICA', etiqueta: 'Prepráctica' },
    { valor: 'PRACTICA', etiqueta: 'Prácticas' },
    { valor: 'PASANTIA', etiqueta: 'Pasantía' },
    { valor: 'TRABAJO', etiqueta: 'Trabajo' },
  ];
  readonly modalidades: OpcionSelect[] = [
    { valor: 'PRESENCIAL', etiqueta: 'Presencial' },
    { valor: 'REMOTO', etiqueta: 'Remoto' },
    { valor: 'HIBRIDO', etiqueta: 'Híbrido' },
  ];
  readonly estados: OpcionSelect[] = [
    { valor: 'ACTIVA', etiqueta: 'Activa' },
    { valor: 'PAUSADA', etiqueta: 'Pausada' },
    { valor: 'CERRADA', etiqueta: 'Cerrada' },
  ];

  readonly form = this.fb.nonNullable.group({
    nombre: ['', Validators.required],
    descripcion: ['', Validators.required],
    tipo: ['PRACTICA', Validators.required],
    modalidad: ['PRESENCIAL', Validators.required],
    pago: [null as number | null],
    ubicacion: [''],
    vacantes: [1, [Validators.required, Validators.min(1)]],
    fecha_vencimiento: [''],
    estado: ['ACTIVA'],
  });

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    this.idPropuesta = id || null;
    this.esEdicion.set(!!id);

    const idCuenta = this.tokenStorage.obtenerIdCuenta();
    if (!idCuenta) return;

    this.empresaService.listar().subscribe({
      next: (empresas) => {
        const mia = empresas.find((e) => e.cuenta_id === idCuenta) ?? null;
        this.empresa.set(mia);
        if (this.esEdicion() && id) {
          this.propuestaService.obtenerPorId(id).subscribe({
            next: (p) => {
              this.form.patchValue({
                nombre: p.nombre,
                descripcion: p.descripcion,
                tipo: p.tipo,
                modalidad: p.modalidad,
                pago: p.pago ?? null,
                ubicacion: p.ubicacion ?? '',
                vacantes: p.vacantes,
                fecha_vencimiento: p.fecha_vencimiento ?? '',
                estado: p.estado,
              });
              this.cargando.set(false);
            },
            error: () => { this.cargando.set(false); this.router.navigate(['/empresa/panel']); },
          });
        } else {
          this.cargando.set(false);
        }
      },
      error: () => this.cargando.set(false),
    });
  }

  guardar(): void {
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }
    const empresa = this.empresa();
    if (!empresa) { this.toast.error('Empresa no encontrada'); return; }

    this.guardando.set(true);
    const datos = this.form.getRawValue();

    if (this.esEdicion() && this.idPropuesta) {
      this.propuestaService.actualizar(this.idPropuesta, datos as any).subscribe({
        next: () => { this.toast.exito('Oferta actualizada'); this.router.navigate(['/empresa/panel']); },
        error: (err) => { this.guardando.set(false); this.toast.error(err.message || 'No se pudo guardar'); },
      });
    } else {
      this.propuestaService.crear(empresa.id_empresa, datos as any).subscribe({
        next: () => { this.toast.exito('Oferta publicada'); this.router.navigate(['/empresa/panel']); },
        error: (err) => { this.guardando.set(false); this.toast.error(err.message || 'No se pudo crear'); },
      });
    }
  }
}