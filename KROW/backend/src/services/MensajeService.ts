import { mensajeRepository } from '../repositories/MensajeRepository';
import { conversacionRepository } from '../repositories/ConversacionRepository';
import { EmisorMensaje } from '../models/Mensaje';
import { AppError } from '../utils/AppError';

export class MensajeService {
    // obtiene los mensajes de una conversacion
    async listar(conversacionId: number) {
        return mensajeRepository.findByConversacion(conversacionId);
    }

    // envia un mensaje dentro de una conversacion
    async enviar(conversacionId: number, emisor: EmisorMensaje, contenido: string) {
        // busca la conversacion
        const conversacion = await conversacionRepository.findById(conversacionId);

        // verifica que la conversacion exista
        if (!conversacion) throw new AppError('Conversación no encontrada', 404);

        // verifica que la conversacion este activa
        if (!conversacion.activa) throw new AppError('Esta conversación está cerrada', 400);

        // verifica que el mensaje no este vacio
        if (!contenido?.trim()) throw new AppError('El mensaje no puede estar vacío', 400);

        // guarda el mensaje
        return mensajeRepository.create(conversacionId, emisor, contenido);
    }

    // marca como leidos los mensajes del emisor contrario
    async marcarLeidos(conversacionId: number, emisorContrario: EmisorMensaje) {
        await mensajeRepository.marcarLeidos(conversacionId, emisorContrario);
    }
}

export const mensajeService = new MensajeService();
