import { verificacionEmpresaRepository } from '../repositories/VerificacionEmpresaRepository';
import { empresaRepository } from '../repositories/EmpresaRepository';
import { EstadoVerificacion, TipoVerificacion } from '../models/VerificacionEmpresa';

export class VerificacionEmpresaService {
    // obtiene las verificaciones de una empresa
    async listarPorEmpresa(empresaId: number) {
        return verificacionEmpresaRepository.findByEmpresa(empresaId);
    }

    // crea una solicitud de verificacion
    async solicitar(empresaId: number, tipoVerificacion: TipoVerificacion) {
        return verificacionEmpresaRepository.create(empresaId, tipoVerificacion);
    }

    // resuelve una solicitud de verificacion
    // si es aprobada marca la empresa como verificada
    async resolver(id: number, empresaId: number, estado: EstadoVerificacion, administrador: string, observacion?: string) {
        // actualiza el estado de la verificacion
        await verificacionEmpresaRepository.resolver(id, estado, administrador, observacion);

        // si fue aprobada marca la empresa como verificada
        if (estado === 'APROBADA') {
            await empresaRepository.update(empresaId, { verificada: true });
        }
    }
}

export const verificacionEmpresaService = new VerificacionEmpresaService();
