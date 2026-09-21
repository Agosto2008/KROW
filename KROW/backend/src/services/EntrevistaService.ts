import { entrevistaRepository } from '../repositories/EntrevistaRepository';
import { Entrevista, EstadoEntrevista } from '../models/Entrevista';
import { AppError } from '../utils/AppError';

export class EntrevistaService {
  async listarPorSolicitud(solicitudId: number) {
    return entrevistaRepository.findBySolicitud(solicitudId);
  }

  async programar(data: Omit<Entrevista, 'id_entrevista' | 'estado'>) {
    return entrevistaRepository.create(data);
  }

  async reprogramar(id: number, data: Partial<Entrevista>) {
    const entrevista = await entrevistaRepository.findById(id);
    if (!entrevista) throw new AppError('Entrevista no encontrada', 404);
    await entrevistaRepository.update(id, { ...data, estado: 'REPROGRAMADA' });
  }

  async cambiarEstado(id: number, estado: EstadoEntrevista) {
    await entrevistaRepository.updateEstado(id, estado);
  }
}

export const entrevistaService = new EntrevistaService();