import { reporteRepository } from '../repositories/ReporteRepository';
import { Reporte, EstadoReporte } from '../models/Reporte';

export class ReporteService {
  async listar(estado?: EstadoReporte) {
    return reporteRepository.findAll(estado);
  }

  async crear(data: Pick<Reporte, 'usuario_id' | 'motivo' | 'descripcion'> & Partial<Reporte>) {
    if (!data.empresa_id && !data.propuesta_id) {
      throw new Error('El reporte debe estar asociado a una empresa o a una propuesta');
    }
    return reporteRepository.create(data);
  }

  async cambiarEstado(id: number, estado: EstadoReporte) {
    await reporteRepository.updateEstado(id, estado);
  }
}

export const reporteService = new ReporteService();