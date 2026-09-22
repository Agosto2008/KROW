import { pool } from '../database/Conexion';
import { Notificacion, TipoNotificacion } from '../models/Notificacion';
import { ResultSetHeader, RowDataPacket } from 'mysql2/promise';

interface NotificacionRow extends Notificacion, RowDataPacket { }

export class NotificacionRepository {
    
    //busca las notificaciones de un usuario por medio de su ID 
    async findByUsuario(usuarioId: number): Promise<NotificacionRow[]> {
        const [rows] = await pool.query<NotificacionRow[]>('SELECT * FROM Notificacion WHERE usuario_id = ? ORDER BY fecha DESC', [usuarioId]);
        return rows;
    }

    //crea una nueva notificacion con su respectivo id y el nombre del emisor 
    async create(usuarioId: number, titulo: string, mensaje: string, tipo: TipoNotificacion): Promise<number> {
        const [result] = await pool.query<ResultSetHeader>(
            'INSERT INTO Notificacion (usuario_id, titulo, mensaje, tipo) VALUES (?, ?, ?, ?)',
            [usuarioId, titulo, mensaje, tipo]
        );
        return result.insertId;
    }

    //marca una notificacion especifica como no leida si asi se necesita 
    async marcarLeida(id: number): Promise<void> {
        await pool.query('UPDATE Notificacion SET leida = TRUE WHERE id_notificacion = ?', [id]);
    }

    //marca todas las notificaciones de un solo usuario como leidas 
    async marcarTodasLeidas(usuarioId: number): Promise<void> {
        await pool.query('UPDATE Notificacion SET leida = TRUE WHERE usuario_id = ?', [usuarioId]);
    }
}

export const notificacionRepository = new NotificacionRepository();