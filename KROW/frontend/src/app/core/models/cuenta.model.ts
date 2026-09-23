export type RolCuenta = 'ADMIN' | 'USUARIO' | 'EMPRESA';
export type EstadoCuenta = 'ACTIVA' | 'INACTIVA' | 'SUSPENDIDA';

export interface Cuenta {
    id_cuenta: number;
    correo: string;
    rol: RolCuenta;
    estado: EstadoCuenta;
    fecha_creacion: string;
}

export interface LoginResponse {
    token: string;
    rol: RolCuenta;
    id_cuenta: number;
}