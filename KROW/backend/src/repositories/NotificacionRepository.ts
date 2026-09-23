import { pool } from '../database/Conexion';
import { Notificacion, TipoNotificacion } from '../models/Notificacion';
import { ResultSetHeader, RowDataPacket } from 'mysql2/promise';

interface NotificacionRow extends Notificacion, RowDataPacket { }

export class NotificacionRepository {

    //notificaciones de una cuenta (USUARIO o EMPRESA), mas recientes primero
    async findByCuenta(cuentaId: number): Promise<NotificacionRow[]> {
        const [rows] = await pool.query<NotificacionRow[]>(
            'SELECT * FROM Notificacion WHERE cuenta_id = ? ORDER BY fecha DESC',
            [cuentaId]
        );
        return rows;
    }

    //busca una notificacion especifica por su ID, para poder validar a quien pertenece
    async findById(id: number): Promise<NotificacionRow | null> {
        const [rows] = await pool.query<NotificacionRow[]>('SELECT * FROM Notificacion WHERE id_notificacion = ?', [id]);
        return rows[0] ?? null;
    }

    //crea una notificacion para la cuenta destinataria
    async create(cuentaId: number, titulo: string, mensaje: string, tipo: TipoNotificacion): Promise<number> {
        const [result] = await pool.query<ResultSetHeader>(
            'INSERT INTO Notificacion (cuenta_id, titulo, mensaje, tipo) VALUES (?, ?, ?, ?)',
            [cuentaId, titulo, mensaje, tipo]
        );
        return result.insertId;
    }

    //marca una notificacion especifica como leida
    async marcarLeida(id: number): Promise<void> {
        await pool.query('UPDATE Notificacion SET leida = TRUE WHERE id_notificacion = ?', [id]);
    }

    //marca todas las notificaciones de una cuenta como leidas
    async marcarTodasLeidas(cuentaId: number): Promise<void> {
        await pool.query('UPDATE Notificacion SET leida = TRUE WHERE cuenta_id = ?', [cuentaId]);
    }

    //contador de no leidas (para la campana del navbar)
    async contarNoLeidas(cuentaId: number): Promise<number> {
        const [rows] = await pool.query<RowDataPacket[]>(
            'SELECT COUNT(*) AS total FROM Notificacion WHERE cuenta_id = ? AND leida = FALSE',
            [cuentaId]
        );
        return rows[0].total;
    }
}

export const notificacionRepository = new NotificacionRepository();
