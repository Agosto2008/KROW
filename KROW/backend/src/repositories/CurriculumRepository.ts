import { pool } from '../database/Conexion';
import { Curriculum } from '../models/Curriculum';
import { ResultSetHeader, RowDataPacket } from 'mysql2/promise';
import { actualizarDinamico } from '../utils/actualizarDinamico';

interface CurriculumRow extends Curriculum, RowDataPacket { }

// PROHIBIDO: usuario_id (mover el CV a otro usuario), id_curriculum.
const COLUMNAS_EDITABLES = [
    'perfil_profesional', 'campo_laboral', 'campo_estudiantil', 'fortalezas',
    'debilidades', 'idiomas', 'habilidades', 'certificaciones', 'portafolio',
] as const;

export class CurriculumRepository {

    //este metodo se encarga de buscar un curriculum asociado a un usuario 
    async findByUsuario(usuarioId: number): Promise<CurriculumRow | null> {
        const [rows] = await pool.query<CurriculumRow[]>('SELECT * FROM Curriculum WHERE usuario_id = ?', [usuarioId]);
        return rows[0] ?? null;
    }

    //se encarga de crear un nuevo curriculum
    async create(usuarioId: number, data: Partial<Curriculum>): Promise<number> {
        const [result] = await pool.query<ResultSetHeader>(
            `INSERT INTO Curriculum
        (usuario_id, perfil_profesional, campo_laboral, campo_estudiantil, fortalezas, debilidades, idiomas, habilidades, certificaciones, portafolio)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [usuarioId, data.perfil_profesional ?? null, data.campo_laboral ?? null, data.campo_estudiantil ?? null,
                data.fortalezas ?? null, data.debilidades ?? null, data.idiomas ?? null, data.habilidades ?? null,
                data.certificaciones ?? null, data.portafolio ?? null]
        );
        return result.insertId;
    }

    //este metodo actualiza el curriculum de un usuario (solo columnas de la whitelist)
    async update(usuarioId: number, data: Partial<Curriculum>): Promise<void> {
        await actualizarDinamico('Curriculum', 'usuario_id', usuarioId, data, COLUMNAS_EDITABLES);
    }
}

export const curriculumRepository = new CurriculumRepository();