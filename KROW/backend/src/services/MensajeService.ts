import { mensajeRepository } from '../repositories/MensajeRepository';
import { conversacionRepository } from '../repositories/ConversacionRepository';
import { EmisorMensaje } from '../models/Mensaje';
import { AppError } from '../utils/AppError';

export class MensajeService {
    async listar(conversacionId: number) {
        return mensajeRepository.findByConversacion(conversacionId);
    }

    async enviar(conversacionId: number, emisor: EmisorMensaje, contenido: string) {
        const conversacion = await conversacionRepository.findById(conversacionId);
        if (!conversacion) throw new AppError('Conversación no encontrada', 404);
        if (!conversacion.activa) throw new AppError('Esta conversación está cerrada', 400);
        if (!contenido?.trim()) throw new AppError('El mensaje no puede estar vacío', 400);

        return mensajeRepository.create(conversacionId, emisor, contenido);
    }

    async marcarLeidos(conversacionId: number, emisorContrario: EmisorMensaje) {
        await mensajeRepository.marcarLeidos(conversacionId, emisorContrario);
    }
}

export const mensajeService = new MensajeService();