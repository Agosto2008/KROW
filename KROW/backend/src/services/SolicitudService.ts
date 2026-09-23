import { solicitudRepository } from '../repositories/SolicitudRepository';
import { conversacionRepository } from '../repositories/ConversacionRepository';
import { propuestaRepository } from '../repositories/PropuestaRepository';
import { empresaRepository } from '../repositories/EmpresaRepository';
import { usuarioRepository } from '../repositories/UsuarioRepository';
import { notificacionService } from './NotificacionService';
import { EstadoSolicitud } from '../models/Solicitud';
import { AppError } from '../utils/AppError';

export class SolicitudService {
  // solicitudes del usuario CON nombre de propuesta y empresa (1 query)
  async listarPorUsuario(usuarioId: number) {
    return solicitudRepository.findByUsuarioConPropuesta(usuarioId);
  }

  // TODAS las solicitudes de las propuestas de una empresa, con candidato (1 query)
  async listarPorEmpresa(empresaId: number) {
    return solicitudRepository.findByEmpresa(empresaId);
  }

  // obtiene las solicitudes de una propuesta
  async listarPorPropuesta(propuestaId: number) {
    return solicitudRepository.findByPropuesta(propuestaId);
  }

  // crea una solicitud por medio de una propuesta existente
  // valida ademas que la propuesta exista y este ACTIVA (no se puede aplicar
  // a ofertas cerradas/pausadas/vencidas)
  async aplicar(usuarioId: number, propuestaId: number) {
    if (!Number.isInteger(propuestaId) || propuestaId < 1) {
      throw new AppError('propuesta_id no valido', 400);
    }

    const propuesta = await propuestaRepository.findById(propuestaId);
    if (!propuesta) throw new AppError('La propuesta indicada no existe', 404);
    if (propuesta.estado !== 'ACTIVA') {
      throw new AppError('Esta propuesta ya no acepta postulaciones', 409);
    }

    // verifica que el usuario no haya aplicado antes
    const existe = await solicitudRepository.yaExiste(usuarioId, propuestaId);

    if (existe) throw new AppError('Ya has aplicado a esta propuesta', 409);

    // crea la solicitud
    const id = await solicitudRepository.create(usuarioId, propuestaId);

    // avisa a la empresa dueña de la oferta (nueva postulacion)
    const empresa = await empresaRepository.findById(propuesta.empresa_id);
    if (empresa) {
      const usuario = await usuarioRepository.findById(usuarioId);
      const candidato = usuario ? `${usuario.primer_nombre} ${usuario.primer_apellido}` : 'Un candidato';
      await notificacionService.notificar(
        empresa.cuenta_id,
        'Nueva postulacion',
        `${candidato} postulo a "${propuesta.nombre}"`,
        'SOLICITUD'
      );
    }

    return id;
  }

  // cambia el estado de una solicitud
  // si es aceptada crea una conversacion automaticamente
  async cambiarEstado(id: number, estado: EstadoSolicitud, comentarioEmpresa?: string) {
    const permitidos: EstadoSolicitud[] = ['PENDIENTE', 'EN_REVISION', 'ACEPTADA', 'RECHAZADA', 'CANCELADA'];
    if (!permitidos.includes(estado)) throw new AppError('Estado de solicitud no valido', 400);

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

    // avisa al candidato del resultado de su postulacion
    const usuario = await usuarioRepository.findById(solicitud.usuario_id);
    if (usuario) {
      const propuesta = await propuestaRepository.findById(solicitud.propuesta_id);
      const titulo =
        estado === 'ACEPTADA' ? 'Solicitud aceptada' :
        estado === 'RECHAZADA' ? 'Solicitud rechazada' :
        'Solicitud actualizada';
      const tipo = estado === 'ACEPTADA' ? 'ACEPTACION' : estado === 'RECHAZADA' ? 'RECHAZO' : 'SOLICITUD';
      await notificacionService.notificar(
        usuario.cuenta_id,
        titulo,
        `Tu postulacion a "${propuesta?.nombre ?? 'una oferta'}" ahora esta en estado ${estado}`,
        tipo
      );
    }
  }
}

export const solicitudService = new SolicitudService();
