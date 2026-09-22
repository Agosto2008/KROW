import { reporteRepository } from '../repositories/ReporteRepository';
import { Reporte, EstadoReporte } from '../models/Reporte';
import { AppError } from '../utils/AppError';

export class ReporteService {
  // obtiene los reportes y puede filtrarlos por estado
  async listar(estado?: EstadoReporte) {
    return reporteRepository.findAll(estado);
  }

  // crea un nuevo reporte
  async crear(data: Pick<Reporte, 'usuario_id' | 'motivo' | 'descripcion'> & Partial<Reporte>) {
    // verifica que el reporte este asociado a una empresa o propuesta
    if (!data.empresa_id && !data.propuesta_id) {
      throw new AppError('El reporte debe estar asociado a una empresa o a una propuesta', 400);
    }

    // guarda el reporte en la base de datos
    return reporteRepository.create(data);
  }

  // cambia el estado de un reporte
  async cambiarEstado(id: number, estado: EstadoReporte) {
    await reporteRepository.updateEstado(id, estado);
  }
}

export const reporteService = new ReporteService();
