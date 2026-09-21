import { conversacionRepository } from '../repositories/ConversacionRepository';

export class ConversacionService {
  async obtenerPorSolicitud(solicitudId: number) {
    const conversacion = await conversacionRepository.findBySolicitud(solicitudId);
    if (!conversacion) throw new Error('No existe conversación para esta solicitud');
    return conversacion;
  }

  async cerrar(id: number) {
    await conversacionRepository.cerrar(id);
  }
}

export const conversacionService = new ConversacionService();