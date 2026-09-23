import { pool } from '../database/Conexion';
import { Reporte, EstadoReporte } from '../models/Reporte';
import { ResultSetHeader, RowDataPacket } from 'mysql2/promise';

interface ReporteRow extends Reporte, RowDataPacket {}

export class ReporteRepository {

  //busca todos los reportes generados por medio de la fecha y el estado 
  async findAll(estado?: EstadoReporte): Promise<ReporteRow[]> {
    if (estado) {
      const [rows] = await pool.query<ReporteRow[]>('SELECT * FROM Reporte WHERE estado = ? ORDER BY fecha DESC', [estado]);
      return rows;
    }
    const [rows] = await pool.query<ReporteRow[]>('SELECT * FROM Reporte ORDER BY fecha DESC');
    return rows;
  }

  //busca un reporte por su id (para no responder "actualizado" a ids inexistentes)
  async findById(id: number): Promise<ReporteRow | null> {
    const [rows] = await pool.query<ReporteRow[]>('SELECT * FROM Reporte WHERE id_reporte = ?', [id]);
    return rows[0] ?? null;
  }

  //crea un reporte asignando el motivo, la descripcion y el id del usuario que lo genero 
  async create(data: Pick<Reporte, 'usuario_id' | 'motivo' | 'descripcion'> & Partial<Reporte>): Promise<number> {
    const [result] = await pool.query<ResultSetHeader>(
      `INSERT INTO Reporte (usuario_id, empresa_id, propuesta_id, motivo, descripcion)
       VALUES (?, ?, ?, ?, ?)`,
      [data.usuario_id, data.empresa_id ?? null, data.propuesta_id ?? null, data.motivo, data.descripcion ?? null]
    );
    return result.insertId;
  }

  //actualiza el estado del resporte generado 
  async updateEstado(id: number, estado: EstadoReporte): Promise<void> {
    await pool.query('UPDATE Reporte SET estado = ? WHERE id_reporte = ?', [estado, id]);
  }
}

export const reporteRepository = new ReporteRepository();