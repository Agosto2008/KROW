import { pool } from '../database/Conexion';
import { Notificacion, TipoNotificacion } from '../models/Notificacion';
import { ResultSetHeader, RowDataPacket } from 'mysql2/promise';

interface NotificacionRow extends Notificacion, RowDataPacket { }

export class NotificacionRepository {
    async findByUsuario(usuarioId: number): Promise<NotificacionRow[]> {
        const [rows] = await pool.query<NotificacionRow[]>('SELECT * FROM Notificacion WHERE usuario_id = ? ORDER BY fecha DESC', [usuarioId]);
        return rows;
    }

    async create(usuarioId: number, titulo: string, mensaje: string, tipo: TipoNotificacion): Promise<number> {
        const [result] = await pool.query<ResultSetHeader>(
            'INSERT INTO Notificacion (usuario_id, titulo, mensaje, tipo) VALUES (?, ?, ?, ?)',
            [usuarioId, titulo, mensaje, tipo]
        );
        return result.insertId;
    }

    async marcarLeida(id: number): Promise<void> {
        await pool.query('UPDATE Notificacion SET leida = TRUE WHERE id_notificacion = ?', [id]);
    }

    async marcarTodasLeidas(usuarioId: number): Promise<void> {
        await pool.query('UPDATE Notificacion SET leida = TRUE WHERE usuario_id = ?', [usuarioId]);
    }
}

export const notificacionRepository = new NotificacionRepository();