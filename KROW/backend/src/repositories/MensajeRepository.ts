import { pool } from '../database/Conexion';
import { Mensaje, EmisorMensaje } from '../models/Mensaje';
import { ResultSetHeader, RowDataPacket } from 'mysql2/promise';

interface MensajeRow extends Mensaje, RowDataPacket { }

export class MensajeRepository {

    //este metodo se encarga de encontrar una conversacion por medio de su ID 
    async findByConversacion(conversacionId: number): Promise<MensajeRow[]> {
        const [rows] = await pool.query<MensajeRow[]>(
            'SELECT * FROM Mensaje WHERE conversacion_id = ? ORDER BY fecha_envio ASC',
            [conversacionId]
        );
        return rows;
    }

    //el metodo crea una nueva conversacion con su id y el respectivo mensaje adjuntado 
    async create(conversacionId: number, emisor: EmisorMensaje, contenido: string): Promise<number> {
        const [result] = await pool.query<ResultSetHeader>(
            'INSERT INTO Mensaje (conversacion_id, emisor, contenido) VALUES (?, ?, ?)',
            [conversacionId, emisor, contenido]
        );
        return result.insertId;
    }

    //se encarga de marcar todos los mensajes como leidos si no llegaron al destinatario mostrando su nombre 
    async marcarLeidos(conversacionId: number, emisorContrario: EmisorMensaje): Promise<void> {
        await pool.query(
            'UPDATE Mensaje SET leido = TRUE WHERE conversacion_id = ? AND emisor = ?',
            [conversacionId, emisorContrario]
        );
    }
}

export const mensajeRepository = new MensajeRepository();