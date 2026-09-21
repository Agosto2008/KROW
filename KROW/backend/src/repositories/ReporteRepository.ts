import { pool } from '../database/Conexion';
import { Reporte, EstadoReporte } from '../models/Reporte';
import { ResultSetHeader, RowDataPacket } from 'mysql2/promise';

interface ReporteRow extends Reporte, RowDataPacket {}

export class ReporteRepository {
  async findAll(estado?: EstadoReporte): Promise<ReporteRow[]> {
    if (estado) {
      const [rows] = await pool.query<ReporteRow[]>('SELECT * FROM Reporte WHERE estado = ? ORDER BY fecha DESC', [estado]);
      return rows;
    }
    const [rows] = await pool.query<ReporteRow[]>('SELECT * FROM Reporte ORDER BY fecha DESC');
    return rows;
  }

  async create(data: Pick<Reporte, 'usuario_id' | 'motivo' | 'descripcion'> & Partial<Reporte>): Promise<number> {
    const [result] = await pool.query<ResultSetHeader>(
      `INSERT INTO Reporte (usuario_id, empresa_id, propuesta_id, motivo, descripcion)
       VALUES (?, ?, ?, ?, ?)`,
      [data.usuario_id, data.empresa_id ?? null, data.propuesta_id ?? null, data.motivo, data.descripcion ?? null]
    );
    return result.insertId;
  }

  async updateEstado(id: number, estado: EstadoReporte): Promise<void> {
    await pool.query('UPDATE Reporte SET estado = ? WHERE id_reporte = ?', [estado, id]);
  }
}

export const reporteRepository = new ReporteRepository();