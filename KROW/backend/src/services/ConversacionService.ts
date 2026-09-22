import { conversacionRepository } from '../repositories/ConversacionRepository';
import { AppError } from '../utils/AppError';

export class ConversacionService {
  // obtiene la conversacion relacionada con una solicitud
  async obtenerPorSolicitud(solicitudId: number) {
    const conversacion = await conversacionRepository.findBySolicitud(solicitudId);

    // verifica que exista una conversacion
    if (!conversacion) throw new AppError('No existe conversación para esta solicitud', 404);
    return conversacion;
  }

  // cierra una conversacion
  async cerrar(id: number) {
    await conversacionRepository.cerrar(id);
  }
}

export const conversacionService = new ConversacionService();
