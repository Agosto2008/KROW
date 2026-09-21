import { pool } from '../database/Conexion';
import { Entrevista, EstadoEntrevista } from '../models/Entrevista';
import { ResultSetHeader, RowDataPacket } from 'mysql2/promise';

interface EntrevistaRow extends Entrevista, RowDataPacket {}

export class EntrevistaRepository {
  async findBySolicitud(solicitudId: number): Promise<EntrevistaRow[]> {
    const [rows] = await pool.query<EntrevistaRow[]>('SELECT * FROM Entrevista WHERE solicitud_id = ? ORDER BY fecha DESC', [solicitudId]);
    return rows;
  }

  async findById(id: number): Promise<EntrevistaRow | null> {
    const [rows] = await pool.query<EntrevistaRow[]>('SELECT * FROM Entrevista WHERE id_entrevista = ?', [id]);
    return rows[0] ?? null;
  }

  async create(data: Omit<Entrevista, 'id_entrevista' | 'estado'>): Promise<number> {
    const [result] = await pool.query<ResultSetHeader>(
      `INSERT INTO Entrevista (solicitud_id, fecha, hora, modalidad, ubicacion, enlace, observaciones)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [data.solicitud_id, data.fecha, data.hora, data.modalidad, data.ubicacion ?? null, data.enlace ?? null, data.observaciones ?? null]
    );
    return result.insertId;
  }

  async updateEstado(id: number, estado: EstadoEntrevista): Promise<void> {
    await pool.query('UPDATE Entrevista SET estado = ? WHERE id_entrevista = ?', [estado, id]);
  }

  async update(id: number, data: Partial<Entrevista>): Promise<void> {
    const campos = Object.keys(data);
    if (campos.length === 0) return;
    const setClause = campos.map((c) => `${c} = ?`).join(', ');
    const valores = campos.map((c) => (data as any)[c]);
    await pool.query(`UPDATE Entrevista SET ${setClause} WHERE id_entrevista = ?`, [...valores, id]);
  }
}

export const entrevistaRepository = new EntrevistaRepository();