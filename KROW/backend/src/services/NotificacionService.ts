import { notificacionRepository } from '../repositories/NotificacionRepository';
import { TipoNotificacion } from '../models/Notificacion';

// Las notificaciones NUNCA deben tumbar el flujo principal (una solicitud que
// falla por no poder notificar seria peor que no notificar): por eso
// "notificar" traga el error y solo lo loguea.
export class NotificacionService {
    // obtiene las notificaciones de una cuenta (usuario o empresa)
    async listar(cuentaId: number) {
        return notificacionRepository.findByCuenta(cuentaId);
    }

    // contador de no leidas para la campana
    async contarNoLeidas(cuentaId: number) {
        return notificacionRepository.contarNoLeidas(cuentaId);
    }

    // crea una nueva notificacion (puede ser invocado por otros services)
    async crear(cuentaId: number, titulo: string, mensaje: string, tipo: TipoNotificacion) {
        return notificacionRepository.create(cuentaId, titulo, mensaje, tipo);
    }

    // version "a prueba de fallos" para usar dentro de otros flujos
    async notificar(cuentaId: number, titulo: string, mensaje: string, tipo: TipoNotificacion): Promise<void> {
        try {
            await notificacionRepository.create(cuentaId, titulo, mensaje, tipo);
        } catch (error) {
            console.error('[notificacion] no se pudo crear la notificacion:', error);
        }
    }

    // marca una notificacion como leida
    async marcarLeida(id: number) {
        await notificacionRepository.marcarLeida(id);
    }

    // marca todas las notificaciones de una cuenta como leidas
    async marcarTodasLeidas(cuentaId: number) {
        await notificacionRepository.marcarTodasLeidas(cuentaId);
    }

    // valida que la notificacion pertenezca a la cuenta del token (o a un ADMIN)
    async verificarPropietario(notificacionId: number, cuentaId: number, esAdmin: boolean) {
        const notificacion = await notificacionRepository.findById(notificacionId);
        if (!notificacion) return { ok: false as const, motivo: 'no-existe' };
        if (esAdmin || notificacion.cuenta_id === cuentaId) return { ok: true as const, notificacion };
        return { ok: false as const, motivo: 'sin-permiso' };
    }
}

export const notificacionService = new NotificacionService();
