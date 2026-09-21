import { solicitudRepository } from '../repositories/SolicitudRepository';
import { conversacionRepository } from '../repositories/ConversacionRepository';
import { EstadoSolicitud } from '../models/Solicitud';
import { AppError } from '../utils/AppError';

export class SolicitudService {
  async listarPorUsuario(usuarioId: number) {
    return solicitudRepository.findByUsuario(usuarioId);
  }

  async listarPorPropuesta(propuestaId: number) {
    return solicitudRepository.findByPropuesta(propuestaId);
  }

  async aplicar(usuarioId: number, propuestaId: number) {
    const existe = await solicitudRepository.yaExiste(usuarioId, propuestaId);
    if (existe) throw new AppError('Ya has aplicado a esta propuesta', 409);
    return solicitudRepository.create(usuarioId, propuestaId);
  }

  // Al aceptar una solicitud, se crea automáticamente la Conversacion asociada
  async cambiarEstado(id: number, estado: EstadoSolicitud, comentarioEmpresa?: string) {
    const solicitud = await solicitudRepository.findById(id);
    if (!solicitud) throw new AppError('Solicitud no encontrada', 404);

    await solicitudRepository.updateEstado(id, estado, comentarioEmpresa);

    if (estado === 'ACEPTADA') {
      const conversacionExistente = await conversacionRepository.findBySolicitud(id);
      if (!conversacionExistente) {
        await conversacionRepository.create(id);
      }
    }
  }
}

export const solicitudService = new SolicitudService();