import { conversacionRepository } from '../repositories/ConversacionRepository';
import { AppError } from '../utils/AppError';

export class ConversacionService {
  async obtenerPorSolicitud(solicitudId: number) {
    const conversacion = await conversacionRepository.findBySolicitud(solicitudId);
    if (!conversacion) throw new AppError('No existe conversación para esta solicitud', 404);
    return conversacion;
  }

  async cerrar(id: number) {
    await conversacionRepository.cerrar(id);
  }
}

export const conversacionService = new ConversacionService();