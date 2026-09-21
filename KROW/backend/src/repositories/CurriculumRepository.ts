import { pool } from '../database/Conexion';
import { Curriculum } from '../models/Curriculum';
import { ResultSetHeader, RowDataPacket } from 'mysql2/promise';

interface CurriculumRow extends Curriculum, RowDataPacket { }

export class CurriculumRepository {
    async findByUsuario(usuarioId: number): Promise<CurriculumRow | null> {
        const [rows] = await pool.query<CurriculumRow[]>('SELECT * FROM Curriculum WHERE usuario_id = ?', [usuarioId]);
        return rows[0] ?? null;
    }

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

    async update(usuarioId: number, data: Partial<Curriculum>): Promise<void> {
        const campos = Object.keys(data);
        if (campos.length === 0) return;
        const setClause = campos.map((c) => `${c} = ?`).join(', ');
        const valores = campos.map((c) => (data as any)[c]);
        await pool.query(`UPDATE Curriculum SET ${setClause} WHERE usuario_id = ?`, [...valores, usuarioId]);
    }
}

export const curriculumRepository = new CurriculumRepository();