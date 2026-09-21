import { propuestaRepository } from '../repositories/PropuestaRepository';
import { empresaRepository } from '../repositories/EmpresaRepository';
import { Propuesta } from '../models/Propuesta';

export class PropuestaService {
    async listar(filtros: Record<string, any>) {
        return propuestaRepository.findAll(filtros);
    }

    async obtenerPorId(id: number) {
        const propuesta = await propuestaRepository.findById(id);
        if (!propuesta) throw new Error('Propuesta no encontrada');
        return propuesta;
    }

    async crear(empresaId: number, data: Omit<Propuesta, 'id_propuesta' | 'fecha_publicacion' | 'estado' | 'empresa_id'>) {
        const empresa = await empresaRepository.findById(empresaId);
        if (!empresa) throw new Error('Empresa no encontrada');
        return propuestaRepository.create({ ...data, empresa_id: empresaId });
    }

    async actualizar(id: number, data: Partial<Propuesta>) {
        await propuestaRepository.update(id, data);
    }

    async eliminar(id: number) {
        await propuestaRepository.delete(id);
    }
}

export const propuestaService = new PropuestaService();