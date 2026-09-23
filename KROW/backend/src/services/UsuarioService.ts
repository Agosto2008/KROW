import { usuarioRepository } from '../repositories/UsuarioRepository';
import { Usuario } from '../models/Usuario';
import { AppError } from '../utils/AppError';

export class UsuarioService {
    // obtiene un usuario por su id
    async obtenerPorId(id: number) {
        const usuario = await usuarioRepository.findById(id);

        // verifica que el usuario exista
        if (!usuario) throw new AppError('Usuario no encontrado', 404);

        return usuario;
    }

    // obtiene un usuario por el id de su cuenta
    async obtenerPorCuenta(cuentaId: number) {
        const usuario = await usuarioRepository.findByCuentaId(cuentaId);

        // verifica que el usuario exista
        if (!usuario) throw new AppError('Usuario no encontrado', 404);

        return usuario;
    }

    // actualiza los datos de un usuario
    async actualizar(id: number, data: Partial<Usuario>) {
        await usuarioRepository.update(id, data);
    }

    // elimina un usuario
    async eliminar(id: number) {
        await usuarioRepository.delete(id);
    }
}

export const usuarioService = new UsuarioService();
