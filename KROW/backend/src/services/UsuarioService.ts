import { usuarioRepository } from '../repositories/UsuarioRepository';
import { Usuario } from '../models/Usuario';

export class UsuarioService {
    async obtenerPorId(id: number) {
        const usuario = await usuarioRepository.findById(id);
        if (!usuario) throw new Error('Usuario no encontrado');
        return usuario;
    }

    async obtenerPorCuenta(cuentaId: number) {
        const usuario = await usuarioRepository.findByCuentaId(cuentaId);
        if (!usuario) throw new Error('Usuario no encontrado');
        return usuario;
    }

    async actualizar(id: number, data: Partial<Usuario>) {
        await usuarioRepository.update(id, data);
    }

    async eliminar(id: number) {
        await usuarioRepository.delete(id);
    }
}

export const usuarioService = new UsuarioService();