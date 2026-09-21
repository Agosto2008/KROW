import { pool } from '../database/Conexion';
import { VerificacionEmpresa, EstadoVerificacion, TipoVerificacion } from '../models/VerificacionEmpresa';
import { ResultSetHeader, RowDataPacket } from 'mysql2/promise';

interface VerificacionRow extends VerificacionEmpresa, RowDataPacket { }

export class VerificacionEmpresaRepository {
    async findByEmpresa(empresaId: number): Promise<VerificacionRow[]> {
        const [rows] = await pool.query<VerificacionRow[]>('SELECT * FROM VerificacionEmpresa WHERE empresa_id = ? ORDER BY fecha DESC', [empresaId]);
        return rows;
    }

    async create(empresaId: number, tipoVerificacion: TipoVerificacion): Promise<number> {
        const [result] = await pool.query<ResultSetHeader>(
            'INSERT INTO VerificacionEmpresa (empresa_id, tipo_verificacion) VALUES (?, ?)',
            [empresaId, tipoVerificacion]
        );
        return result.insertId;
    }

    async resolver(id: number, estado: EstadoVerificacion, administrador: string, observacion?: string): Promise<void> {
        await pool.query(
            'UPDATE VerificacionEmpresa SET estado = ?, administrador = ?, observacion = ? WHERE id_verificacion = ?',
            [estado, administrador, observacion ?? null, id]
        );
    }
}

export const verificacionEmpresaRepository = new VerificacionEmpresaRepository();