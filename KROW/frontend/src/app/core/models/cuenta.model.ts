export type Rol = 'ADMIN' | 'USUARIO' | 'EMPRESA';
export type EstadoCuenta = 'ACTIVA' | 'INACTIVA' | 'SUSPENDIDA';

export interface Cuenta {
  id_cuenta: number;
  correo: string;
  // password nunca debería llegar del backend en respuestas GET,
  // se deja opcional solo para los DTOs de registro/login.
  password?: string;
  rol: Rol;
  estado: EstadoCuenta;
  fecha_creacion: string; // ISO datetime
}

/**
 * GET /cuentas (ADMIN) = cuenta con el perfil ya resuelto en la misma query.
 * Un ADMIN no tiene perfil, por eso los ids de perfil son opcionales.
 */
export interface CuentaResumen extends Cuenta {
  id_usuario?: number | null;
  primer_nombre?: string | null;
  segundo_nombre?: string | null;
  primer_apellido?: string | null;
  segundo_apellido?: string | null;
  id_empresa?: number | null;
  empresa_nombre?: string | null;
  verificada?: boolean | null;
}
