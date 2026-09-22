// services/VerificacionEmpresaService.ts
import { verificacionEmpresaRepository } from '../repositories/VerificacionEmpresaRepository';
import { empresaRepository } from '../repositories/EmpresaRepository';
import { cuentaRepository } from '../repositories/CuentaRepository';
import { EstadoVerificacion, TipoVerificacion } from '../models/VerificacionEmpresa';
import { AppError } from '../utils/AppError';

export class VerificacionEmpresaService {
    async listarPorEmpresa(empresaId: number) {
        return verificacionEmpresaRepository.findByEmpresa(empresaId);
    }

    async solicitar(empresaId: number, tipoVerificacion: TipoVerificacion) {
        return verificacionEmpresaRepository.create(empresaId, tipoVerificacion);
    }

    // administradorCuentaId viene del token (req.user.id_cuenta), nunca del body:
    // asi queda registrado quien resolvio realmente la verificacion, no lo que
    // el cliente decida mandar.
    async resolver(id: number, estado: EstadoVerificacion, administradorCuentaId: number, observacion?: string) {
        const verificacion = await verificacionEmpresaRepository.findById(id);
        if (!verificacion) throw new AppError('Verificación no encontrada', 404);

        const cuentaAdmin = await cuentaRepository.findById(administradorCuentaId);
        const administrador = cuentaAdmin?.correo ?? `cuenta_${administradorCuentaId}`;

        await verificacionEmpresaRepository.resolver(id, estado, administrador, observacion);

        if (estado === 'APROBADA') {
            await empresaRepository.update(verificacion.empresa_id, { verificada: true });
        }
    }
}

export const verificacionEmpresaService = new VerificacionEmpresaService();