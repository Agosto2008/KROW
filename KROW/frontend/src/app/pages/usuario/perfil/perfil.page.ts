import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { UsuarioService } from '../../../services/usuario.service';
import { TokenStorageService } from '../../../core/token-storage.service';
import { ToastService } from '../../../shader/toast/toast.service';
import { Usuario } from '../../../models/Index';
import { CampoInputComponent } from '../../../shader/campo-input/campo-input.component';
import { CampoTextareaComponent } from '../../../shader/campo-textarea/campo-textarea.component';
import { BotonComponent } from '../../../shader/boton/boton.component';
import { ModalComponent } from '../../../shader/modal/modal.component';
import { SpinnerComponent } from '../../../shader/spinner/spinner.component';

@Component({
  selector: 'app-perfil-page',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, CampoInputComponent, CampoTextareaComponent, BotonComponent, ModalComponent, SpinnerComponent],
  templateUrl: './perfil.page.html',
  styleUrl: './perfil.page.css',
})
export class PerfilPage implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly usuarioService = inject(UsuarioService);
  private readonly tokenStorage = inject(TokenStorageService);
  private readonly toast = inject(ToastService);

  readonly usuario = signal<Usuario | null>(null);
  readonly cargando = signal(true);
  readonly modalAbierto = signal(false);
  readonly guardando = signal(false);

  readonly form = this.fb.nonNullable.group({
    primer_nombre: ['', Validators.required],
    segundo_nombre: [''],
    primer_apellido: ['', Validators.required],
    segundo_apellido: [''],
    telefono: [''],
    descripcion_personal: [''],
    direccion: [''],
    fecha_nacimiento: [''],
  });

  ngOnInit(): void {
    const id = this.tokenStorage.obtenerIdCuenta();
    if (!id) return;
    this.usuarioService.obtenerPorId(id).subscribe({
      next: (u) => {
        this.usuario.set(u);
        this.form.patchValue({
          primer_nombre: u.primer_nombre,
          segundo_nombre: u.segundo_nombre ?? '',
          primer_apellido: u.primer_apellido,
          segundo_apellido: u.segundo_apellido ?? '',
          telefono: u.telefono ?? '',
          descripcion_personal: u.descripcion_personal ?? '',
          direccion: u.direccion ?? '',
          fecha_nacimiento: u.fecha_nacimiento ?? '',
        });
        this.cargando.set(false);
      },
      error: () => this.cargando.set(false),
    });
  }

  abrirModal(): void { this.modalAbierto.set(true); }
  cerrarModal(): void { this.modalAbierto.set(false); }

  guardar(): void {
    const u = this.usuario();
    if (!u || this.form.invalid) return;
    this.guardando.set(true);
    this.usuarioService.actualizar(u.id_usuario, this.form.getRawValue()).subscribe({
      next: () => {
        this.toast.exito('Perfil actualizado');
        this.guardando.set(false);
        this.cerrarModal();
        this.usuario.set({ ...u, ...this.form.getRawValue() } as Usuario);
      },
      error: (err) => {
        this.guardando.set(false);
        this.toast.error(err.message || 'No se pudo actualizar');
      },
    });
  }

  get iniciales(): string {
    const u = this.usuario();
    if (!u) return '';
    return `${u.primer_nombre.charAt(0)}${u.primer_apellido.charAt(0)}`.toUpperCase();
  }

  get nombreCompleto(): string {
    const u = this.usuario();
    if (!u) return '';
    return [u.primer_nombre, u.segundo_nombre, u.primer_apellido, u.segundo_apellido].filter(Boolean).join(' ');
  }
}