import { pool } from '../database/Conexion';
import { Mensaje, EmisorMensaje } from '../models/Mensaje';
import { ResultSetHeader, RowDataPacket } from 'mysql2/promise';

interface MensajeRow extends Mensaje, RowDataPacket { }

export class MensajeRepository {
    async findByConversacion(conversacionId: number): Promise<MensajeRow[]> {
        const [rows] = await pool.query<MensajeRow[]>(
            'SELECT * FROM Mensaje WHERE conversacion_id = ? ORDER BY fecha_envio ASC',
            [conversacionId]
        );
        return rows;
    }

    async create(conversacionId: number, emisor: EmisorMensaje, contenido: string): Promise<number> {
        const [result] = await pool.query<ResultSetHeader>(
            'INSERT INTO Mensaje (conversacion_id, emisor, contenido) VALUES (?, ?, ?)',
            [conversacionId, emisor, contenido]
        );
        return result.insertId;
    }

    async marcarLeidos(conversacionId: number, emisorContrario: EmisorMensaje): Promise<void> {
        // Marca como leídos todos los mensajes que NO fueron enviados por quien está consultando
        await pool.query(
            'UPDATE Mensaje SET leido = TRUE WHERE conversacion_id = ? AND emisor = ?',
            [conversacionId, emisorContrario]
        );
    }
}

export const mensajeRepository = new MensajeRepository();