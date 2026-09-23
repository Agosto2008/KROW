import { Request, Response, NextFunction } from 'express';
import { AppError } from '../utils/AppError';

// Validacion de bodies sin dependencias externas: lanza AppError(400) con un
// mensaje claro en lugar de dejar que MySQL falle y el error middleware
// responda un 500 generico.

// ---- Catalogos de enums (deben coincidir con DB_KROW.sql) ----
export const ENUMS = {
    rol: ['ADMIN', 'USUARIO', 'EMPRESA'],
    estadoCuenta: ['ACTIVA', 'INACTIVA', 'SUSPENDIDA'],
    tipoPropuesta: ['PREPRACTICA', 'PRACTICA', 'PASANTIA', 'TRABAJO'],
    modalidad: ['PRESENCIAL', 'REMOTO', 'HIBRIDO'],
    estadoPropuesta: ['ACTIVA', 'PAUSADA', 'CERRADA', 'VENCIDA'],
    estadoSolicitud: ['PENDIENTE', 'EN_REVISION', 'ACEPTADA', 'RECHAZADA', 'CANCELADA'],
    modalidadEntrevista: ['PRESENCIAL', 'VIRTUAL', 'TELEFONICA'],
    estadoEntrevista: ['PROGRAMADA', 'REPROGRAMADA', 'REALIZADA', 'CANCELADA'],
    tipoVerificacion: ['SIN VERIFICACION', 'PLATA', 'PLATINO', 'DIAMANTE'],
    estadoVerificacion: ['PENDIENTE', 'APROBADA', 'RECHAZADA'],
    estadoReporte: ['PENDIENTE', 'EN_REVISION', 'RESUELTO', 'DESCARTADO'],
    tipoNotificacion: ['MENSAJE', 'SOLICITUD', 'ENTREVISTA', 'ACEPTACION', 'RECHAZO', 'SISTEMA'],
} as const;

type EnumKey = keyof typeof ENUMS;

// ---- Helpers ----

export function texto(body: any, campo: string, opciones: { requerido?: boolean; min?: number; max?: number } = {}): string | undefined {
    const valor = body?.[campo];
    const { requerido = false, min = 1, max = 5000 } = opciones;

    if (valor === undefined || valor === null || valor === '') {
        if (requerido) throw new AppError(`El campo "${campo}" es obligatorio`, 400);
        return undefined;
    }
    if (typeof valor !== 'string') throw new AppError(`El campo "${campo}" debe ser texto`, 400);
    const limpio = valor.trim();
    if (requerido && limpio.length < min) {
        throw new AppError(`El campo "${campo}" debe tener al menos ${min} caracteres`, 400);
    }
    if (limpio.length > max) {
        throw new AppError(`El campo "${campo}" no puede superar ${max} caracteres`, 400);
    }
    return limpio;
}

export function entero(body: any, campo: string, opciones: { requerido?: boolean; min?: number } = {}): number | undefined {
    const valor = body?.[campo];
    const { requerido = false, min = 1 } = opciones;

    if (valor === undefined || valor === null) {
        if (requerido) throw new AppError(`El campo "${campo}" es obligatorio`, 400);
        return undefined;
    }
    const numero = Number(valor);
    if (!Number.isInteger(numero) || numero < min) {
        throw new AppError(`El campo "${campo}" debe ser un numero entero mayor o igual a ${min}`, 400);
    }
    return numero;
}

export function decimal(body: any, campo: string): number | undefined {
    const valor = body?.[campo];
    if (valor === undefined || valor === null || valor === '') return undefined;
    const numero = Number(valor);
    if (Number.isNaN(numero) || numero < 0) {
        throw new AppError(`El campo "${campo}" debe ser un numero mayor o igual a 0`, 400);
    }
    return numero;
}

export function enumDe(body: any, campo: string, catalogo: EnumKey, opciones: { requerido?: boolean } = {}): string | undefined {
    const valor = body?.[campo];
    const { requerido = false } = opciones;

    if (valor === undefined || valor === null || valor === '') {
        if (requerido) throw new AppError(`El campo "${campo}" es obligatorio`, 400);
        return undefined;
    }
    const permitidos: readonly string[] = ENUMS[catalogo];
    if (!permitidos.includes(valor)) {
        throw new AppError(`El campo "${campo}" tiene un valor no valido`, 400);
    }
    return valor;
}

export function correo(body: any, campo = 'correo'): string {
    const valor = texto(body, campo, { requerido: true, max: 150 });
    const esCorreo = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(valor!);
    if (!esCorreo) throw new AppError('El correo no tiene un formato valido', 400);
    return valor!;
}

export function password(body: any, campo = 'password'): string {
    const valor = texto(body, campo, { requerido: true, max: 72 });
    if (valor!.length < 8) throw new AppError('La password debe tener al menos 8 caracteres', 400);
    return valor!;
}

// Usa los helpers dentro de un handler: envuelve y deja que next(error) pase el 400.
export function validar(req: Request, res: Response, next: NextFunction, fn: () => void) {
    try {
        fn();
        next();
    } catch (error) {
        next(error);
    }
}
