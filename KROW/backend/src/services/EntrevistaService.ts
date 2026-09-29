import { entrevistaRepository } from '../repositories/EntrevistaRepository';
import { solicitudRepository } from '../repositories/SolicitudRepository';
import { propuestaRepository } from '../repositories/PropuestaRepository';
import { usuarioRepository } from '../repositories/UsuarioRepository';
import { empresaRepository } from '../repositories/EmpresaRepository';
import { notificacionService } from './NotificacionService';
import { Entrevista, EstadoEntrevista } from '../models/Entrevista';
import { AppError } from '../utils/AppError';

export class EntrevistaService {
  // obtiene las entrevistas de una solicitud
  async listarPorSolicitud(solicitudId: number) {
    return entrevistaRepository.findBySolicitud(solicitudId);
  }

  // TODAS las entrevistas del candidato (con propuesta y empresa, 1 query)
  async listarPorUsuario(usuarioId: number) {
    return entrevistaRepository.findByUsuario(usuarioId);
  }

  // TODAS las entrevistas de la empresa (con candidato, 1 query)
  async listarPorEmpresa(empresaId: number) {
    return entrevistaRepository.findByEmpresa(empresaId);
  }

  // crea una nueva entrevista
  async programar(data: Omit<Entrevista, 'id_entrevista' | 'estado'>) {
    if (!Number.isInteger(Number(data.solicitud_id)) || Number(data.solicitud_id) < 1) {
      throw new AppError('solicitud_id no valido', 400);
    }
    if (!data.fecha) throw new AppError('El campo "fecha" es obligatorio', 400);
    if (!data.modalidad) throw new AppError('El campo "modalidad" es obligatorio', 400);
    const modalidades = ['PRESENCIAL', 'VIRTUAL', 'TELEFONICA'];
    if (!modalidades.includes(data.modalidad)) throw new AppError('modalidad no valida', 400);

    const id = await entrevistaRepository.create(data);

    // avisa al candidato que le programaron una entrevista
    await this.notificarCandidato(Number(data.solicitud_id), `Te programaron una entrevista para el ${data.fecha}`, 'ENTREVISTA');

    return id;
  }

  // reprograma una entrevista existente
  async reprogramar(id: number, data: Partial<Entrevista>) {
    const entrevista = await entrevistaRepository.findById(id);

    // verifica que la entrevista exista
    if (!entrevista) throw new AppError('Entrevista no encontrada', 404);

    // actualiza los datos y cambia el estado a reprogramada
    await entrevistaRepository.update(id, { ...data, estado: 'REPROGRAMADA' });

    await this.notificarCandidato(entrevista.solicitud_id, 'Tu entrevista fue reprogramada', 'ENTREVISTA');
  }

  // cambia el estado de una entrevista
  async cambiarEstado(id: number, estado: EstadoEntrevista) {
    const permitidos: EstadoEntrevista[] = ['PROGRAMADA', 'REPROGRAMADA', 'REALIZADA', 'CANCELADA'];
    if (!permitidos.includes(estado)) throw new AppError('Estado de entrevista no valido', 400);

    const entrevista = await entrevistaRepository.findById(id);
    if (!entrevista) throw new AppError('Entrevista no encontrada', 404);

    await entrevistaRepository.updateEstado(id, estado);

    const mensajes: Record<string, string> = {
      REALIZADA: 'Tu entrevista fue marcada como realizada',
      CANCELADA: 'Tu entrevista fue cancelada',
      REPROGRAMADA: 'Tu entrevista fue reprogramada',
      PROGRAMADA: 'Tu entrevista vuelve a estar programada',
    };
    if (mensajes[estado]) {
      await this.notificarCandidato(entrevista.solicitud_id, mensajes[estado], 'ENTREVISTA');
    }
  }

  // notifica al candidato de la solicitud indicada (nunca tira del flujo principal)
  private async notificarCandidato(solicitudId: number, mensaje: string, tipo: 'ENTREVISTA'): Promise<void> {
    try {
      const solicitud = await solicitudRepository.findById(solicitudId);
      if (!solicitud) return;
      const usuario = await usuarioRepository.findById(solicitud.usuario_id);
      if (!usuario) return;
      const propuesta = await propuestaRepository.findById(solicitud.propuesta_id);
      await notificacionService.notificar(
        usuario.cuenta_id,
        'Entrevista',
        propuesta ? `${mensaje} (${propuesta.nombre})` : mensaje,
        tipo
      );
    } catch (error) {
      console.error('[entrevista] no se pudo notificar al candidato:', error);
    }
  }
}

export const entrevistaService = new EntrevistaService();
