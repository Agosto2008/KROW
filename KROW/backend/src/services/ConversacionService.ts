import { conversacionRepository } from '../repositories/ConversacionRepository';
import { usuarioRepository } from '../repositories/UsuarioRepository';
import { empresaRepository } from '../repositories/EmpresaRepository';
import { AppError } from '../utils/AppError';

export class ConversacionService {
  // SIDEBAR: todas las conversaciones de la cuenta autenticada
  // (usuario -> las suyas; empresa -> las de sus ofertas), 1 query
  async listarPropias(idCuenta: number, rol: string) {
    if (rol === 'USUARIO') {
      const usuario = await usuarioRepository.findByCuentaId(idCuenta);
      if (!usuario) throw new AppError('No existe un perfil de usuario asociado a esta cuenta', 404);
      return conversacionRepository.findByUsuario(usuario.id_usuario);
    }
    if (rol === 'EMPRESA') {
      const empresa = await empresaRepository.findByCuentaId(idCuenta);
      if (!empresa) throw new AppError('No existe un perfil de empresa asociado a esta cuenta', 404);
      return conversacionRepository.findByEmpresa(empresa.id_empresa);
    }
    // un ADMIN no tiene chats propios
    return [];
  }

  // obtiene la conversacion relacionada con una solicitud
  async obtenerPorSolicitud(solicitudId: number) {
    const conversacion = await conversacionRepository.findBySolicitud(solicitudId);

    // verifica que exista una conversacion
    if (!conversacion) throw new AppError('No existe conversación para esta solicitud', 404);
    return conversacion;
  }

  // cierra una conversacion
  async cerrar(id: number) {
    await conversacionRepository.cerrar(id);
  }
}

export const conversacionService = new ConversacionService();
