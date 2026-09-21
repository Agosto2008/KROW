import { verificacionEmpresaRepository } from '../repositories/VerificacionEmpresaRepository';
import { empresaRepository } from '../repositories/EmpresaRepository';
import { EstadoVerificacion, TipoVerificacion } from '../models/VerificacionEmpresa';

export class VerificacionEmpresaService {
    async listarPorEmpresa(empresaId: number) {
        return verificacionEmpresaRepository.findByEmpresa(empresaId);
    }

    async solicitar(empresaId: number, tipoVerificacion: TipoVerificacion) {
        return verificacionEmpresaRepository.create(empresaId, tipoVerificacion);
    }

    // Solo un ADMIN resuelve; si se aprueba, se marca la Empresa como verificada
    async resolver(id: number, empresaId: number, estado: EstadoVerificacion, administrador: string, observacion?: string) {
        await verificacionEmpresaRepository.resolver(id, estado, administrador, observacion);
        if (estado === 'APROBADA') {
            await empresaRepository.update(empresaId, { verificada: true });
        }
    }
}

export const verificacionEmpresaService = new VerificacionEmpresaService();