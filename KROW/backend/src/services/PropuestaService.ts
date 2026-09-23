import { propuestaRepository } from '../repositories/PropuestaRepository';
import { empresaRepository } from '../repositories/EmpresaRepository';
import { Propuesta } from '../models/Propuesta';
import { AppError } from '../utils/AppError';

export class PropuestaService {
    // obtiene las propuestas aplicando los filtros recibidos
    async listar(filtros: Record<string, any>) {
        return propuestaRepository.findAll(filtros);
    }

    // obtiene una propuesta por su id
    async obtenerPorId(id: number) {
        const propuesta = await propuestaRepository.findById(id);

        // verifica que la propuesta exista
        if (!propuesta) throw new AppError('Propuesta no encontrada', 404);

        return propuesta;
    }

    // crea una nueva propuesta para una empresa
    async crear(empresaId: number, data: Omit<Propuesta, 'id_propuesta' | 'fecha_publicacion' | 'estado' | 'empresa_id'>) {
        // verifica que la empresa exista
        const empresa = await empresaRepository.findById(empresaId);
        if (!empresa) throw new AppError('Empresa no encontrada', 404);

        // crea la propuesta asociandola con la empresa
        return propuestaRepository.create({ ...data, empresa_id: empresaId });
    }

    // actualiza los datos de una propuesta
    async actualizar(id: number, data: Partial<Propuesta>) {
        await propuestaRepository.update(id, data);
    }

    // elimina una propuesta
    async eliminar(id: number) {
        await propuestaRepository.delete(id);
    }
}

export const propuestaService = new PropuestaService();
