import { mensajeRepository } from '../repositories/MensajeRepository';
import { conversacionRepository } from '../repositories/ConversacionRepository';
import { solicitudRepository } from '../repositories/SolicitudRepository';
import { propuestaRepository } from '../repositories/PropuestaRepository';
import { empresaRepository } from '../repositories/EmpresaRepository';
import { usuarioRepository } from '../repositories/UsuarioRepository';
import { notificacionService } from './NotificacionService';
import { EmisorMensaje } from '../models/Mensaje';
import { AppError } from '../utils/AppError';

export class MensajeService {
    // obtiene los mensajes de una conversacion
    async listar(conversacionId: number) {
        return mensajeRepository.findByConversacion(conversacionId);
    }

    // envia un mensaje dentro de una conversacion
    // emisor: 'USUARIO' | 'EMPRESA' -> quien recibe la notificacion es el lado contrario
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
        const id = await mensajeRepository.create(conversacionId, emisor, contenido.trim());

        // notifica al lado contrario de la conversacion
        await this.notificarReceptor(conversacion.solicitud_id, emisor, contenido.trim());

        return id;
    }

    // resuelve la cuenta del lado contrario y le manda la notificacion
    private async notificarReceptor(solicitudId: number, emisor: EmisorMensaje, contenido: string): Promise<void> {
        try {
            const solicitud = await solicitudRepository.findById(solicitudId);
            if (!solicitud) return;

            if (emisor === 'USUARIO') {
                // escribe el candidato -> notifica a la empresa de la propuesta
                const propuesta = await propuestaRepository.findById(solicitud.propuesta_id);
                if (!propuesta) return;
                const empresa = await empresaRepository.findById(propuesta.empresa_id);
                if (empresa) {
                    await notificacionService.notificar(
                        empresa.cuenta_id,
                        'Nuevo mensaje',
                        `Nuevo mensaje del candidato sobre "${propuesta.nombre}": ${contenido.slice(0, 80)}`,
                        'MENSAJE'
                    );
                }
            } else {
                // escribe la empresa -> notifica al candidato
                const usuario = await usuarioRepository.findById(solicitud.usuario_id);
                if (usuario) {
                    const propuesta = await propuestaRepository.findById(solicitud.propuesta_id);
                    await notificacionService.notificar(
                        usuario.cuenta_id,
                        'Nuevo mensaje',
                        `Nuevo mensaje de la empresa sobre "${propuesta?.nombre ?? 'una oferta'}": ${contenido.slice(0, 80)}`,
                        'MENSAJE'
                    );
                }
            }
        } catch (error) {
            console.error('[mensaje] no se pudo notificar al receptor:', error);
        }
    }

    // marca como leidos los mensajes del emisor contrario
    async marcarLeidos(conversacionId: number, emisorContrario: EmisorMensaje) {
        await mensajeRepository.marcarLeidos(conversacionId, emisorContrario);
    }
}

export const mensajeService = new MensajeService();
