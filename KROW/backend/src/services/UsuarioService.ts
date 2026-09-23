import { usuarioRepository } from '../repositories/UsuarioRepository';
import { cuentaRepository } from '../repositories/CuentaRepository';
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

    // PERFIL PUBLICO del candidato: nombre + CV resumido, sin datos sensibles.
    // Esta es la vista que usa la EMPRESA para conocer a un postulante.
    async obtenerPublico(id: number) {
        const perfil = await usuarioRepository.findPublico(id);
        if (!perfil) throw new AppError('Usuario no encontrado', 404);
        return perfil;
    }

    // obtiene un usuario por el id de su cuenta
    async obtenerPorCuenta(cuentaId: number) {
        const usuario = await usuarioRepository.findByCuentaId(cuentaId);

        // verifica que el usuario exista
        if (!usuario) throw new AppError('Usuario no encontrado', 404);

        return usuario;
    }

    // actualiza los datos de un usuario (valida formatos basicos)
    async actualizar(id: number, data: Partial<Usuario>) {
        const usuario = await usuarioRepository.findById(id);
        if (!usuario) throw new AppError('Usuario no encontrado', 404);

        if (data.fecha_nacimiento !== undefined && data.fecha_nacimiento !== null) {
            if (Number.isNaN(Date.parse(String(data.fecha_nacimiento)))) {
                throw new AppError('fecha_nacimiento no es una fecha valida (use YYYY-MM-DD)', 400);
            }
        }
        if (data.telefono !== undefined && data.telefono !== null) {
            const tel = String(data.telefono).trim();
            if (tel && !/^[0-9+\-() ]{5,20}$/.test(tel)) {
                throw new AppError('telefono no valido', 400);
            }
        }

        await usuarioRepository.update(id, data);
    }

    // elimina un usuario INCLUYENDO su cuenta (antes quedaba una cuenta
    // huermfana que seguia pudiendo iniciar sesion con perfil null).
    // Las FK de Usuario -> Cuenta tienen ON DELETE CASCADE, asi que borrar la
    // cuenta arrastra perfil, curriculum, solicitudes, etc.
    async eliminar(id: number) {
        const usuario = await usuarioRepository.findById(id);
        if (!usuario) throw new AppError('Usuario no encontrado', 404);

        await cuentaRepository.delete(usuario.cuenta_id);
    }
}

export const usuarioService = new UsuarioService();
