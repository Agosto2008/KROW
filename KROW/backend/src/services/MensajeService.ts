import { mensajeRepository } from '../repositories/MensajeRepository';
import { conversacionRepository } from '../repositories/ConversacionRepository';
import { EmisorMensaje } from '../models/Mensaje';

export class MensajeService {
    async listar(conversacionId: number) {
        return mensajeRepository.findByConversacion(conversacionId);
    }

    async enviar(conversacionId: number, emisor: EmisorMensaje, contenido: string) {
        const conversacion = await conversacionRepository.findById(conversacionId);
        if (!conversacion) throw new Error('Conversación no encontrada');
        if (!conversacion.activa) throw new Error('Esta conversación está cerrada');
        if (!contenido?.trim()) throw new Error('El mensaje no puede estar vacío');

        return mensajeRepository.create(conversacionId, emisor, contenido);
    }

    async marcarLeidos(conversacionId: number, emisorContrario: EmisorMensaje) {
        await mensajeRepository.marcarLeidos(conversacionId, emisorContrario);
    }
}

export const mensajeService = new MensajeService();