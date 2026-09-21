import { curriculumRepository } from '../repositories/CurriculumRepository';
import { Curriculum } from '../models/Curriculum';
import { AppError } from '../utils/AppError';

export class CurriculumService {
    async obtenerPorUsuario(usuarioId: number) {
        const curriculum = await curriculumRepository.findByUsuario(usuarioId);
        if (!curriculum) throw new AppError('Este usuario no tiene curriculum creado', 404);
        return curriculum;
    }

    // upsert: si ya existe lo actualiza, si no lo crea (usuario_id es UNIQUE en la tabla)
    async guardar(usuarioId: number, data: Partial<Curriculum>) {
        const existente = await curriculumRepository.findByUsuario(usuarioId);
        if (existente) {
            await curriculumRepository.update(usuarioId, data);
        } else {
            await curriculumRepository.create(usuarioId, data);
        }
    }
}

export const curriculumService = new CurriculumService();