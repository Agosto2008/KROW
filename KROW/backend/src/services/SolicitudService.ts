import { solicitudRepository } from '../repositories/SolicitudRepository';
import { conversacionRepository } from '../repositories/ConversacionRepository';
import { EstadoSolicitud } from '../models/Solicitud';
import { AppError } from '../utils/AppError';

export class SolicitudService {
  // obtiene las solicitudes de un usuario
  async listarPorUsuario(usuarioId: number) {
    return solicitudRepository.findByUsuario(usuarioId);
  }

  // obtiene las solicitudes de una propuesta
  async listarPorPropuesta(propuestaId: number) {
    return solicitudRepository.findByPropuesta(propuestaId);
  }

  // permite a un usuario aplicar a una propuesta
  async aplicar(usuarioId: number, propuestaId: number) {
    // verifica que el usuario no haya aplicado antes
    const existe = await solicitudRepository.yaExiste(usuarioId, propuestaId);

    if (existe) throw new AppError('Ya has aplicado a esta propuesta', 409);

    // crea la solicitud
    return solicitudRepository.create(usuarioId, propuestaId);
  }

  // cambia el estado de una solicitud
  // si es aceptada crea una conversacion automaticamente
  async cambiarEstado(id: number, estado: EstadoSolicitud, comentarioEmpresa?: string) {
    // busca la solicitud
    const solicitud = await solicitudRepository.findById(id);

    // verifica que la solicitud exista
    if (!solicitud) throw new AppError('Solicitud no encontrada', 404);

    // actualiza el estado de la solicitud
    await solicitudRepository.updateEstado(id, estado, comentarioEmpresa);

    // si la solicitud fue aceptada verifica si ya existe una conversacion
    if (estado === 'ACEPTADA') {
      const conversacionExistente = await conversacionRepository.findBySolicitud(id);

      // crea la conversacion si todavia no existe
      if (!conversacionExistente) {
        await conversacionRepository.create(id);
      }
    }
  }
}

export const solicitudService = new SolicitudService();
