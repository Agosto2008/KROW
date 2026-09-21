import { notificacionRepository } from '../repositories/NotificacionRepository';
import { TipoNotificacion } from '../models/Notificacion';

export class NotificacionService {
    async listar(usuarioId: number) {
        return notificacionRepository.findByUsuario(usuarioId);
    }

    // Pensado para llamarse internamente desde otros services (ej. al aceptar una Solicitud)
    async crear(usuarioId: number, titulo: string, mensaje: string, tipo: TipoNotificacion) {
        return notificacionRepository.create(usuarioId, titulo, mensaje, tipo);
    }

    async marcarLeida(id: number) {
        await notificacionRepository.marcarLeida(id);
    }

    async marcarTodasLeidas(usuarioId: number) {
        await notificacionRepository.marcarTodasLeidas(usuarioId);
    }
}

export const notificacionService = new NotificacionService();