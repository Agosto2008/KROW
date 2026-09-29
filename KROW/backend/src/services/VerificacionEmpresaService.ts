// services/VerificacionEmpresaService.ts
import { verificacionEmpresaRepository } from '../repositories/VerificacionEmpresaRepository';
import { empresaRepository } from '../repositories/EmpresaRepository';
import { cuentaRepository } from '../repositories/CuentaRepository';
import { notificacionService } from './NotificacionService';
import { EstadoVerificacion, TipoVerificacion } from '../models/VerificacionEmpresa';
import { AppError } from '../utils/AppError';

export class VerificacionEmpresaService {
    async listarPorEmpresa(empresaId: number) {
        return verificacionEmpresaRepository.findByEmpresa(empresaId);
    }

    // COLA DEL ADMIN: todas las verificaciones (filtro por estado opcional)
    // con el nombre de la empresa ya resuelto (1 query)
    async listarTodas(estado?: string) {
        if (estado && !['PENDIENTE', 'APROBADA', 'RECHAZADA'].includes(estado)) {
            throw new AppError('estado no valido', 400);
        }
        return verificacionEmpresaRepository.findAll(estado);
    }

    async solicitar(empresaId: number, tipoVerificacion: TipoVerificacion) {
        // solo se admite un plan real (no "SIN VERIFICACION")
        const planes = ['PLATA', 'PLATINO', 'DIAMANTE'];
        if (!planes.includes(tipoVerificacion)) {
            throw new AppError('Tipo de verificación no valido', 400);
        }

        // no se admiten varias solicitudes PENDIENTE a la vez
        const pendiente = await verificacionEmpresaRepository.tienePendiente(empresaId);
        if (pendiente) {
            throw new AppError('Ya tienes una solicitud de verificación pendiente', 409);
        }

        const id = await verificacionEmpresaRepository.create(empresaId, tipoVerificacion);

        // la empresa recibe el acuse de recibo de SU solicitud
        const empresa = await empresaRepository.findById(empresaId);
        if (empresa) {
            await notificacionService.notificar(
                empresa.cuenta_id,
                'Solicitud de verificacion enviada',
                `Recibimos tu solicitud de verificacion ${tipoVerificacion}. Te avisaremos cuando el equipo KROW la revise.`,
                'SISTEMA'
            );
        }

        return id;
    }

    // administradorCuentaId viene del token (req.user.id_cuenta), nunca del body:
    // asi queda registrado quien resolvio realmente la verificacion, no lo que
    // el cliente decida mandar.
    async resolver(id: number, estado: EstadoVerificacion, administradorCuentaId: number, observacion?: string) {
        if (estado !== 'APROBADA' && estado !== 'RECHAZADA') {
            throw new AppError('estado debe ser APROBADA o RECHAZADA', 400);
        }

        const verificacion = await verificacionEmpresaRepository.findById(id);
        if (!verificacion) throw new AppError('Verificación no encontrada', 404);

        // no se puede resolver dos veces la misma solicitud
        if (verificacion.estado !== 'PENDIENTE') {
            throw new AppError(`Esta verificación ya fue ${verificacion.estado.toLowerCase()}`, 409);
        }

        const cuentaAdmin = await cuentaRepository.findById(administradorCuentaId);
        const administrador = cuentaAdmin?.correo ?? `cuenta_${administradorCuentaId}`;

        await verificacionEmpresaRepository.resolver(id, estado, administrador, observacion);

        if (estado === 'APROBADA') {
            await empresaRepository.marcarVerificada(verificacion.empresa_id, true);
        }

        // avisa a la empresa del resultado de SU solicitud de verificacion
        const empresa = await empresaRepository.findById(verificacion.empresa_id);
        if (empresa) {
            await notificacionService.notificar(
                empresa.cuenta_id,
                estado === 'APROBADA' ? 'Verificacion aprobada' : 'Verificacion rechazada',
                estado === 'APROBADA'
                    ? `¡Felicidades! Tu empresa ahora tiene la insignia de verificacion ${verificacion.tipo_verificacion}.`
                    : `Tu solicitud de verificacion fue rechazada.${observacion ? ` Motivo: ${observacion}` : ''}`,
                'SISTEMA'
            );
        }
    }
}

export const verificacionEmpresaService = new VerificacionEmpresaService();