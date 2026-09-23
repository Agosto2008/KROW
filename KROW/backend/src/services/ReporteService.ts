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

    // motivo obligatorio y con longitud razonable
    const motivo = typeof data.motivo === 'string' ? data.motivo.trim() : '';
    if (!motivo) throw new AppError('El campo "motivo" es obligatorio', 400);
    if (motivo.length > 150) throw new AppError('El motivo no puede superar 150 caracteres', 400);

    // guarda el reporte en la base de datos
    return reporteRepository.create({ ...data, motivo });
  }

  // cambia el estado de un reporte (valida enum + existencia: antes devolvia
  // "actualizado" aunque el id no existiera)
  async cambiarEstado(id: number, estado: EstadoReporte) {
    const permitidos: EstadoReporte[] = ['PENDIENTE', 'EN_REVISION', 'RESUELTO', 'DESCARTADO'];
    if (!permitidos.includes(estado)) throw new AppError('Estado de reporte no valido', 400);

    const reporte = await reporteRepository.findById(id);
    if (!reporte) throw new AppError('Reporte no encontrado', 404);

    await reporteRepository.updateEstado(id, estado);
  }
}

export const reporteService = new ReporteService();
