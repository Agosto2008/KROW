import { pool } from '../database/Conexion';
import { Conversacion } from '../models/Conversacion';
import { ResultSetHeader, RowDataPacket } from 'mysql2/promise';

interface ConversacionRow extends Conversacion, RowDataPacket {}

export class ConversacionRepository {
  //Este metodo busca una conversacion relacionada con una solicitud
  async findBySolicitud(solicitudId: number): Promise<ConversacionRow | null> {
    const [rows] = await pool.query<ConversacionRow[]>('SELECT * FROM Conversacion WHERE solicitud_id = ?', [solicitudId]);
    return rows[0] ?? null;
  }

  //busca especificamente una conversacion por medio de id 
  async findById(id: number): Promise<ConversacionRow | null> {
    const [rows] = await pool.query<ConversacionRow[]>('SELECT * FROM Conversacion WHERE id_conversacion = ?', [id]);
    return rows[0] ?? null;
  }

  //recibe el id de la solicitud anterior y devuelve un id de la conversacion en curso
  async create(solicitudId: number): Promise<number> {
    const [result] = await pool.query<ResultSetHeader>(
      'INSERT INTO Conversacion (solicitud_id) VALUES (?)',
      [solicitudId]
    );
    return result.insertId;
  }

  //este metodo se encarga de cerrar una conversacion en curso 
  async cerrar(id: number): Promise<void> {
    await pool.query('UPDATE Conversacion SET activa = FALSE WHERE id_conversacion = ?', [id]);
  }
}

export const conversacionRepository = new ConversacionRepository();