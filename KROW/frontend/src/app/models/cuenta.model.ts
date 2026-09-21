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