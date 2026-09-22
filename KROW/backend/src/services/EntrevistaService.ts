import { entrevistaRepository } from '../repositories/EntrevistaRepository';
import { Entrevista, EstadoEntrevista } from '../models/Entrevista';
import { AppError } from '../utils/AppError';

export class EntrevistaService {
  // obtiene las entrevistas de una solicitud
  async listarPorSolicitud(solicitudId: number) {
    return entrevistaRepository.findBySolicitud(solicitudId);
  }

  // crea una nueva entrevista
  async programar(data: Omit<Entrevista, 'id_entrevista' | 'estado'>) {
    return entrevistaRepository.create(data);
  }

  // reprograma una entrevista existente
  async reprogramar(id: number, data: Partial<Entrevista>) {
    const entrevista = await entrevistaRepository.findById(id);

    // verifica que la entrevista exista
    if (!entrevista) throw new AppError('Entrevista no encontrada', 404);

    // actualiza los datos y cambia el estado a reprogramada
    await entrevistaRepository.update(id, { ...data, estado: 'REPROGRAMADA' });
  }

  // cambia el estado de una entrevista
  async cambiarEstado(id: number, estado: EstadoEntrevista) {
    await entrevistaRepository.updateEstado(id, estado);
  }
}

export const entrevistaService = new EntrevistaService();
