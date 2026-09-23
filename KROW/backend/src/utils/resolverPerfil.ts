import { Request } from 'express';
import { usuarioRepository } from '../repositories/UsuarioRepository';
import { empresaRepository } from '../repositories/EmpresaRepository';
import { propuestaRepository } from '../repositories/PropuestaRepository';
import { solicitudRepository } from '../repositories/SolicitudRepository';
import { conversacionRepository } from '../repositories/ConversacionRepository';
import { entrevistaRepository } from '../repositories/EntrevistaRepository';
import { notificacionRepository } from '../repositories/NotificacionRepository';
import { AppError } from './AppError';

// Estas funciones existen para no confiar NUNCA en un usuario_id / empresa_id
// que venga del body o de los params: siempre se deriva del id_cuenta que
// viene firmado dentro del JWT (req.user), que es lo único que no se puede falsificar.

export async function obtenerUsuarioIdDelToken(req: Request): Promise<number> {
    const usuario = await usuarioRepository.findByCuentaId(req.user!.id_cuenta);
    if (!usuario) throw new AppError('No existe un perfil de usuario asociado a esta cuenta', 404);
    return usuario.id_usuario;
}

export async function obtenerEmpresaIdDelToken(req: Request): Promise<number> {
    const empresa = await empresaRepository.findByCuentaId(req.user!.id_cuenta);
    if (!empresa) throw new AppError('No existe un perfil de empresa asociado a esta cuenta', 404);
    return empresa.id_empresa;
}

// Para rutas tipo /usuarios/:id donde solo el dueño (o un ADMIN) puede modificar
export async function verificarPropietarioUsuario(req: Request, idUsuarioObjetivo: number): Promise<void> {
    if (req.user!.rol === 'ADMIN') return;
    const idUsuarioToken = await obtenerUsuarioIdDelToken(req);
    if (idUsuarioToken !== idUsuarioObjetivo) {
        throw new AppError('No tienes permiso para modificar este recurso', 403);
    }
}

export async function verificarPropietarioEmpresa(req: Request, idEmpresaObjetivo: number): Promise<void> {
    if (req.user!.rol === 'ADMIN') return;
    const idEmpresaToken = await obtenerEmpresaIdDelToken(req);
    if (idEmpresaToken !== idEmpresaObjetivo) {
        throw new AppError('No tienes permiso para modificar este recurso', 403);
    }
}

// Para rutas tipo /propuestas/:id donde solo la empresa dueña (o un ADMIN) puede editar/borrar
export async function verificarPropietarioPropuesta(req: Request, idPropuestaObjetivo: number): Promise<void> {
    if (req.user!.rol === 'ADMIN') return;
    const propuesta = await propuestaRepository.findById(idPropuestaObjetivo);
    if (!propuesta) throw new AppError('Propuesta no encontrada', 404);
    const idEmpresaToken = await obtenerEmpresaIdDelToken(req);
    if (idEmpresaToken !== propuesta.empresa_id) {
        throw new AppError('No tienes permiso para modificar esta propuesta', 403);
    }
}

// Verifica que la cuenta autenticada (USUARIO o EMPRESA) sea parte de la
// Solicitud indicada, siguiendo la cadena Solicitud -> Propuesta -> Empresa.
// Devuelve el rol ('USUARIO' | 'EMPRESA') que le corresponde a esta cuenta.
export async function verificarParticipanteSolicitud(req: Request, solicitudId: number): Promise<'USUARIO' | 'EMPRESA'> {
    if (req.user!.rol === 'ADMIN') return 'EMPRESA';

    const solicitud = await solicitudRepository.findById(solicitudId);
    if (!solicitud) throw new AppError('Solicitud no encontrada', 404);

    if (req.user!.rol === 'USUARIO') {
        const idUsuario = await obtenerUsuarioIdDelToken(req);
        if (idUsuario !== solicitud.usuario_id) {
            throw new AppError('No participas en esta solicitud', 403);
        }
        return 'USUARIO';
    }

    const propuesta = await propuestaRepository.findById(solicitud.propuesta_id);
    if (!propuesta) throw new AppError('Propuesta asociada no encontrada', 404);
    const idEmpresa = await obtenerEmpresaIdDelToken(req);
    if (idEmpresa !== propuesta.empresa_id) {
        throw new AppError('No participas en esta solicitud', 403);
    }
    return 'EMPRESA';
}

// Igual que la anterior pero a partir de una Conversacion (Conversacion -> Solicitud).
// Devuelve el emisor ('USUARIO' | 'EMPRESA') que le corresponde a esta cuenta,
// para no depender nunca de lo que mande el cliente en el body.
export async function verificarParticipanteConversacion(req: Request, conversacionId: number): Promise<'USUARIO' | 'EMPRESA'> {
    const conversacion = await conversacionRepository.findById(conversacionId);
    if (!conversacion) throw new AppError('Conversación no encontrada', 404);
    return verificarParticipanteSolicitud(req, conversacion.solicitud_id);
}

// Igual que las anteriores pero a partir de una Entrevista (Entrevista -> Solicitud).
// Solo la empresa o el usuario que participan en la solicitud asociada (o un ADMIN)
// pueden programar, reprogramar o cambiar el estado de la entrevista.
export async function verificarParticipanteEntrevista(req: Request, entrevistaId: number): Promise<'USUARIO' | 'EMPRESA'> {
    const entrevista = await entrevistaRepository.findById(entrevistaId);
    if (!entrevista) throw new AppError('Entrevista no encontrada', 404);
    return verificarParticipanteSolicitud(req, entrevista.solicitud_id);
}

// Para rutas tipo /notificaciones/:id donde solo el dueño (o un ADMIN) puede leer/modificar
export async function verificarPropietarioNotificacion(req: Request, idNotificacion: number): Promise<void> {
    if (req.user!.rol === 'ADMIN') return;
    const notificacion = await notificacionRepository.findById(idNotificacion);
    if (!notificacion) throw new AppError('Notificación no encontrada', 404);
    const idUsuarioToken = await obtenerUsuarioIdDelToken(req);
    if (idUsuarioToken !== notificacion.usuario_id) {
        throw new AppError('No tienes permiso para modificar esta notificación', 403);
    }
}