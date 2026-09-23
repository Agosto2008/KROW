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
        // valida que los campos que lleguen sean texto (evita que un numero/object
        // termine en columnas TEXT y reviente en runtime)
        const camposTexto = [
            'perfil_profesional', 'campo_laboral', 'campo_estudiantil', 'fortalezas',
            'debilidades', 'idiomas', 'habilidades', 'certificaciones', 'portafolio',
        ];
        for (const campo of camposTexto) {
            const valor = (data as any)[campo];
            if (valor !== undefined && valor !== null && typeof valor !== 'string') {
                throw new AppError(`El campo "${campo}" debe ser texto`, 400);
            }
        }

        const existente = await curriculumRepository.findByUsuario(usuarioId);
        if (existente) {
            await curriculumRepository.update(usuarioId, data);
        } else {
            await curriculumRepository.create(usuarioId, data);
        }
    }
}

export const curriculumService = new CurriculumService();