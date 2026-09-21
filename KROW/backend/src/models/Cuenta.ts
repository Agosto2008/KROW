export type RolCuenta = 'ADMIN' | 'USUARIO' | 'EMPRESA';

export type EstadoCuenta =
  | 'ACTIVA'
  | 'INACTIVA'
  | 'SUSPENDIDA';

export interface Cuenta {
  id_cuenta: number;
  correo: string;
  password: string;
  rol: RolCuenta;
  estado: EstadoCuenta;
  fecha_creacion: Date;
}
