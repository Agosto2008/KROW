import { notificacionRepository } from '../repositories/NotificacionRepository';
import { TipoNotificacion } from '../models/Notificacion';

export class NotificacionService {
    // obtiene las notificaciones de un usuario
    async listar(usuarioId: number) {
        return notificacionRepository.findByUsuario(usuarioId);
    }

    // crea una nueva notificacion
    // puede ser utilizado por otros services
    async crear(usuarioId: number, titulo: string, mensaje: string, tipo: TipoNotificacion) {
        return notificacionRepository.create(usuarioId, titulo, mensaje, tipo);
    }

    // marca una notificacion como leida
    async marcarLeida(id: number) {
        await notificacionRepository.marcarLeida(id);
    }

    // marca todas las notificaciones de un usuario como leidas
    async marcarTodasLeidas(usuarioId: number) {
        await notificacionRepository.marcarTodasLeidas(usuarioId);
    }
}

export const notificacionService = new NotificacionService();
